import { test, describe, after, before } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import pool from "../apps/backend/src/config/db.js";
import { env } from "../apps/backend/src/config/env.js";
import {
  createCheckoutOrder,
  verifyPaymentAndActivate,
  processRazorpayWebhook,
} from "../apps/backend/src/services/checkout.service.js";
import { getUserPurchases, getUserEntitlements } from "../apps/backend/src/services/profile.service.js";

describe("Checkout, Razorpay Integration & Entitlement Tests", () => {
  let testUserId = null;
  let testProductId = null;
  let freePlanId = null;
  let paidPlanId = null;

  before(async () => {
    // 1. Create a test user
    const userRes = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ('Checkout Tester', $1, 'hash')
      RETURNING id;
      `,
      [`checkout_${Date.now()}@hubhub.dev`]
    );
    testUserId = userRes.rows[0].id;

    // 2. Fetch an existing product and its plans
    const prodRes = await pool.query(
      `SELECT id FROM api_products WHERE slug = 'qr-code' LIMIT 1;`
    );
    testProductId = prodRes.rows[0].id;

    const plansRes = await pool.query(
      `SELECT id, price_amount FROM api_plans WHERE api_product_id = $1 ORDER BY price_amount ASC;`,
      [testProductId]
    );

    const free = plansRes.rows.find((p) => p.price_amount === 0);
    const paid = plansRes.rows.find((p) => p.price_amount > 0);
    freePlanId = free.id;
    paidPlanId = paid.id;

    // Set test secret for signature calculation
    env.razorpayKeyId = env.razorpayKeyId || "rzp_test_mock";
    env.razorpayKeySecret = env.razorpayKeySecret || "test_rzp_secret_for_tests";
    env.razorpayWebhookSecret = env.razorpayWebhookSecret || "test_webhook_secret_for_tests";
  });

  after(async () => {
    if (testUserId) {
      await pool.query("DELETE FROM user_api_entitlements WHERE user_id = $1;", [testUserId]);
      await pool.query("DELETE FROM user_purchases WHERE user_id = $1;", [testUserId]);
      await pool.query("DELETE FROM payment_orders WHERE user_id = $1;", [testUserId]);
      await pool.query("DELETE FROM users WHERE id = $1;", [testUserId]);
    }
    await pool.end();
  });

  test("Free plan checkout: activates entitlement instantly with zero charge", async () => {
    const result = await createCheckoutOrder(testUserId, {
      apiProductId: testProductId,
      planId: freePlanId,
    });

    assert.equal(result.isFree, true);
    assert.equal(result.status, "paid");
    assert.ok(result.entitlement);
    assert.equal(result.entitlement.status, "active");
    assert.ok(result.purchase);

    // Verify in database via profile service
    const purchases = await getUserPurchases(testUserId);
    assert.ok(purchases.length >= 1);
    const p = purchases.find((x) => x.id === result.purchase.id);
    assert.ok(p);
    assert.equal(p.status, "paid");
    assert.equal(p.amountPaid, 0);

    const entitlements = await getUserEntitlements(testUserId);
    const ent = entitlements.find((e) => e.product.id === testProductId);
    assert.ok(ent);
    assert.equal(ent.status, "active");
  });

  test("Paid plan checkout: retrieves authoritative price and creates pending order", async () => {
    const result = await createCheckoutOrder(testUserId, {
      apiProductId: testProductId,
      planId: paidPlanId,
    });

    assert.equal(result.isFree, false);
    assert.ok(result.order);
    assert.equal(result.order.status, "pending");
    assert.ok(result.order.amount > 0);
    assert.equal(result.order.currency, "INR");
    assert.ok(result.order.orderReference.startsWith("ord_"));
  });

  test("Payment verification: Rejects invalid or forged Razorpay signature", async () => {
    // 1. Create order
    const { order } = await createCheckoutOrder(testUserId, {
      apiProductId: testProductId,
      planId: paidPlanId,
    });

    // 2. Attempt verification with forged signature
    await assert.rejects(
      async () =>
        verifyPaymentAndActivate(testUserId, {
          orderReference: order.orderReference,
          razorpayOrderId: order.razorpayOrderId || "fake_rzp_order_123",
          razorpayPaymentId: "pay_fake_payment_456",
          razorpaySignature: "forged_invalid_signature_hash",
        }),
      /verification failed/i
    );
  });

  test("Payment verification: Valid signature activates entitlement and creates purchase", async () => {
    // 1. Create order
    const { order } = await createCheckoutOrder(testUserId, {
      apiProductId: testProductId,
      planId: paidPlanId,
    });

    const rzpOrderId = order.razorpayOrderId || `rzp_test_order_${Date.now()}`;
    const rzpPaymentId = `pay_test_${Date.now()}`;

    // 2. Generate valid HMAC-SHA256 signature using the configured secret (or fallback dev secret)
    const secret = env.razorpayKeySecret || "dev_razorpay_secret_test";
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest("hex");

    // 3. Verify payment
    const verified = await verifyPaymentAndActivate(testUserId, {
      orderReference: order.orderReference,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: validSignature,
    });

    assert.ok(verified.purchase);
    assert.equal(verified.purchase.status, "paid");
    assert.ok(verified.entitlement);
    assert.equal(verified.entitlement.status, "active");
    assert.ok(verified.entitlement.requestsQuota > 0);

    // 4. Idempotency test: Verifying the same payment again returns existing purchase without duplicates
    const reVerified = await verifyPaymentAndActivate(testUserId, {
      orderReference: order.orderReference,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: validSignature,
    });

    assert.equal(reVerified.purchase.id, verified.purchase.id);
  });

  test("Webhook: Rejects unsigned or forged webhook payloads", async () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const forgedSig = "invalid_webhook_sig";

    await assert.rejects(
      async () => processRazorpayWebhook(rawBody, forgedSig),
      /Invalid Razorpay webhook signature/i
    );
  });
});
