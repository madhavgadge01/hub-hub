import crypto from "crypto";
import Razorpay from "razorpay";
import pool from "../config/db.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { queuePurchaseConfirmationEmail } from "./email.service.js";

/**
 * Initializes Razorpay instance if credentials exist.
 */
function getRazorpayInstance() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return null;
  }
  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
}

/**
 * Creates a checkout order for an API product and plan.
 * Validates authoritative price from PostgreSQL.
 * If price is 0 (Free plan), provisions free entitlement immediately.
 */
export async function createCheckoutOrder(firstArg, secondArg = {}) {
  let userId, userEmail, productId, planId;
  if (typeof firstArg === "object" && firstArg !== null) {
    userId = firstArg.userId;
    userEmail = firstArg.userEmail;
    productId = firstArg.productId || firstArg.apiProductId;
    planId = firstArg.planId;
  } else {
    userId = firstArg;
    userEmail = secondArg.userEmail;
    productId = secondArg.productId || secondArg.apiProductId;
    planId = secondArg.planId;
  }

  if (!productId || !planId) {
    throw new ApiError(400, "API Product ID and Plan ID are required.");
  }

  // 1. Fetch product and plan with authoritative prices from DB
  const planQuery = await pool.query(
    `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      p.slug AS product_slug,
      p.icon_url AS product_icon,
      p.status AS product_status,
      pl.id AS plan_id,
      pl.name AS plan_name,
      pl.plan_type,
      pl.price_amount,
      pl.currency,
      pl.billing_interval,
      pl.included_requests,
      pl.rate_limit_per_minute
    FROM api_plans pl
    JOIN api_products p ON pl.api_product_id = p.id
    WHERE pl.id = $1 AND p.id = $2 AND pl.is_active = TRUE;
    `,
    [planId, productId]
  );

  const planRow = planQuery.rows[0];
  if (!planRow) {
    throw new ApiError(404, "Selected plan not found or is currently inactive.");
  }

  if (planRow.product_status !== "published") {
    throw new ApiError(400, "This API product is not currently available for purchase.");
  }

  const orderReference = `ord_hh_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  // 2. Free Plan: Instant direct entitlement activation
  if (planRow.price_amount === 0) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Check if user already has an active entitlement for this product
      const existingEntitlement = await client.query(
        `
        SELECT id FROM user_api_entitlements
        WHERE user_id = $1 AND api_product_id = $2 AND status = 'active'
        LIMIT 1;
        `,
        [userId, planRow.product_id]
      );

      if (existingEntitlement.rows.length > 0) {
        await client.query("COMMIT");
        return {
          isFree: true,
          success: true,
          message: "You already have an active entitlement for this API product.",
          entitlementId: existingEntitlement.rows[0].id,
          product: {
            id: planRow.product_id,
            name: planRow.product_name,
            slug: planRow.product_slug,
          },
          plan: {
            id: planRow.plan_id,
            name: planRow.plan_name,
          },
        };
      }

      const purchaseRef = `pur_free_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const purchaseRes = await client.query(
        `
        INSERT INTO user_purchases (
          purchase_reference, user_id, api_product_id, plan_id,
          amount_paid, currency, status, payment_reference
        )
        VALUES ($1, $2, $3, $4, 0, $5, 'paid', 'free_grant')
        RETURNING id, purchase_reference, purchased_at;
        `,
        [purchaseRef, userId, planRow.product_id, planRow.plan_id, planRow.currency]
      );

      const purchase = purchaseRes.rows[0];

      const entitlementRes = await client.query(
        `
        INSERT INTO user_api_entitlements (
          user_id, purchase_id, api_product_id, plan_id,
          requests_quota, rate_limit_per_minute, valid_until
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '30 days')
        RETURNING id, requests_quota, rate_limit_per_minute, status;
        `,
        [
          userId,
          purchase.id,
          planRow.product_id,
          planRow.plan_id,
          planRow.included_requests,
          planRow.rate_limit_per_minute,
        ]
      );

      await client.query("COMMIT");

      // Optional email notification for free grant
      if (userEmail) {
        queuePurchaseConfirmationEmail({
          recipientEmail: userEmail,
          productName: planRow.product_name,
          planName: planRow.plan_name,
          amountPaid: 0,
          currency: planRow.currency,
          purchaseReference: purchase.purchase_reference,
        });
      }

      return {
        isFree: true,
        success: true,
        status: "paid",
        message: "Free starter plan activated successfully!",
        purchase: {
          id: purchase.id,
          purchaseReference: purchase.purchase_reference,
          status: "paid",
        },
        purchaseId: purchase.id,
        purchaseReference: purchase.purchase_reference,
        entitlement: entitlementRes.rows[0],
        product: {
          id: planRow.product_id,
          name: planRow.product_name,
          slug: planRow.product_slug,
        },
        plan: {
          id: planRow.plan_id,
          name: planRow.plan_name,
        },
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // 3. Paid Plan: Check Razorpay credentials
  const rzp = getRazorpayInstance();
  const isMock =
    env.razorpayKeyId === "rzp_test_mock" ||
    env.nodeEnv === "test" ||
    process.env.NODE_ENV === "test";
  if (!rzp && !isMock) {
    return {
      isFree: false,
      configMissing: true,
      message: "Razorpay payment integration is awaiting credentials in server configuration. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.",
      product: {
        id: planRow.product_id,
        name: planRow.product_name,
        slug: planRow.product_slug,
        icon: planRow.product_icon,
      },
      plan: {
        id: planRow.plan_id,
        name: planRow.plan_name,
        priceAmount: planRow.price_amount,
        currency: planRow.currency,
        billingInterval: planRow.billing_interval,
        includedRequests: planRow.included_requests,
        rateLimitPerMinute: planRow.rate_limit_per_minute,
      },
    };
  }

  // 4. Create internal pending payment_orders record
  const orderRes = await pool.query(
    `
    INSERT INTO payment_orders (
      order_reference, user_id, api_product_id, plan_id,
      amount, currency, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'created')
    RETURNING id, order_reference;
    `,
    [
      orderReference,
      userId,
      planRow.product_id,
      planRow.plan_id,
      planRow.price_amount,
      planRow.currency,
    ]
  );
  const internalOrder = orderRes.rows[0];

  // 5. Create Razorpay Order
  let rzpOrder;
  if (!rzp || isMock) {
    rzpOrder = { id: `order_test_${Date.now()}` };
  } else {
    try {
      rzpOrder = await rzp.orders.create({
        amount: planRow.price_amount,
        currency: planRow.currency,
        receipt: internalOrder.order_reference,
        notes: {
          userId,
          internalOrderId: internalOrder.id,
          productId: planRow.product_id,
          planId: planRow.plan_id,
        },
      });
    } catch (err) {
      await pool.query(
        "UPDATE payment_orders SET status = 'failed' WHERE id = $1;",
        [internalOrder.id]
      );
      throw new ApiError(502, `Failed to initialize Razorpay checkout order: ${err.message}`);
    }
  }

  // 6. Update payment_orders with Razorpay order ID
  await pool.query(
    "UPDATE payment_orders SET razorpay_order_id = $1 WHERE id = $2;",
    [rzpOrder.id, internalOrder.id]
  );

  const orderPayload = {
    id: internalOrder.id,
    orderReference: internalOrder.order_reference,
    razorpayOrderId: rzpOrder.id,
    amount: planRow.price_amount,
    currency: planRow.currency,
    status: "pending",
  };

  return {
    isFree: false,
    configMissing: false,
    order: orderPayload,
    orderId: internalOrder.id,
    orderReference: internalOrder.order_reference,
    razorpayOrderId: rzpOrder.id,
    amount: planRow.price_amount,
    currency: planRow.currency,
    keyId: env.razorpayKeyId,
    product: {
      id: planRow.product_id,
      name: planRow.product_name,
      slug: planRow.product_slug,
      icon: planRow.product_icon,
    },
    plan: {
      id: planRow.plan_id,
      name: planRow.plan_name,
      priceAmount: planRow.price_amount,
      currency: planRow.currency,
      billingInterval: planRow.billing_interval,
      includedRequests: planRow.included_requests,
      rateLimitPerMinute: planRow.rate_limit_per_minute,
    },
  };
}

/**
 * Verifies Razorpay payment signature and activates purchased entitlement.
 * Handles duplicate verification calls idempotently.
 */
export async function verifyPaymentAndActivateEntitlement(firstArg, secondArg = {}) {
  let userId, userEmail, userName, orderId, orderReference, razorpayOrderId, razorpayPaymentId, razorpaySignature;
  if (typeof firstArg === "object" && firstArg !== null) {
    ({ userId, userEmail, userName, orderId, orderReference, razorpayOrderId, razorpayPaymentId, razorpaySignature } = firstArg);
  } else {
    userId = firstArg;
    ({ userEmail, userName, orderId, orderReference, razorpayOrderId, razorpayPaymentId, razorpaySignature } = secondArg);
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Missing payment verification parameters (orderId, paymentId, signature).");
  }

  const effectiveSecret = env.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
  if (!effectiveSecret) {
    throw new ApiError(500, "RAZORPAY_KEY_SECRET is not configured on this server.");
  }

  // 1. Verify cryptographic HMAC SHA256 signature
  const expectedSignature = crypto
    .createHmac("sha256", effectiveSecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Payment verification failed. Invalid digital signature.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 2. Lock and retrieve order row for update
    const orderRes = await client.query(
      `
      SELECT
        o.*,
        p.name AS product_name,
        p.slug AS product_slug,
        p.icon_url AS product_icon,
        pl.name AS plan_name,
        pl.included_requests,
        pl.rate_limit_per_minute
      FROM payment_orders o
      JOIN api_products p ON o.api_product_id = p.id
      JOIN api_plans pl ON o.plan_id = pl.id
      WHERE (o.id = $1 OR o.razorpay_order_id = $2 OR o.order_reference = $4) AND o.user_id = $3
      FOR UPDATE;
      `,
      [orderId || null, razorpayOrderId, userId, orderReference || null]
    );

    const order = orderRes.rows[0];
    if (!order) {
      throw new ApiError(404, "Matching order record not found for this user.");
    }

    // 3. Idempotency: If already paid, return existing purchase and entitlement
    if (order.status === "paid") {
      const existingPurchase = await client.query(
        `
        SELECT p.*, e.id AS entitlement_id, e.requests_quota, e.requests_used
        FROM user_purchases p
        LEFT JOIN user_api_entitlements e ON e.purchase_id = p.id
        WHERE p.payment_order_id = $1
        LIMIT 1;
        `,
        [order.id]
      );

      await client.query("COMMIT");
      return {
        success: true,
        alreadyProcessed: true,
        message: "Payment has already been confirmed and entitlement is active.",
        purchase: existingPurchase.rows[0],
      };
    }

    // 4. Update order status to 'paid'
    await client.query(
      "UPDATE payment_orders SET status = 'paid', updated_at = NOW() WHERE id = $1;",
      [order.id]
    );

    // 5. Create durable purchase record
    const purchaseRef = `pur_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const purchaseRes = await client.query(
      `
      INSERT INTO user_purchases (
        purchase_reference, user_id, api_product_id, plan_id,
        payment_order_id, payment_reference, amount_paid, currency, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'paid')
      RETURNING *;
      `,
      [
        purchaseRef,
        userId,
        order.api_product_id,
        order.plan_id,
        order.id,
        razorpayPaymentId,
        order.amount,
        order.currency,
      ]
    );
    const purchase = purchaseRes.rows[0];

    // 6. Provision and activate API entitlement
    const entitlementRes = await client.query(
      `
      INSERT INTO user_api_entitlements (
        user_id, purchase_id, api_product_id, plan_id,
        requests_quota, rate_limit_per_minute, valid_until
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '30 days')
      RETURNING *;
      `,
      [
        userId,
        purchase.id,
        order.api_product_id,
        order.plan_id,
        order.included_requests,
        order.rate_limit_per_minute,
      ]
    );
    const entitlement = entitlementRes.rows[0];

    await client.query("COMMIT");

    // 7. Enqueue transactional confirmation email via Brevo outbox
    queuePurchaseConfirmationEmail({
      recipientEmail: userEmail,
      recipientName: userName,
      productName: order.product_name,
      planName: order.plan_name,
      amountPaid: order.amount,
      currency: order.currency,
      purchaseReference: purchase.purchase_reference,
    });

    return {
      success: true,
      message: "Payment successfully verified! Your API access entitlement is active.",
      purchase: {
        id: purchase.id,
        purchaseReference: purchase.purchase_reference,
        amountPaid: purchase.amount_paid,
        currency: purchase.currency,
        status: purchase.status,
        purchasedAt: purchase.purchased_at,
        productName: order.product_name,
        planName: order.plan_name,
      },
      entitlement: {
        id: entitlement.id,
        requestsQuota: entitlement.requests_quota,
        requestsUsed: entitlement.requests_used,
        rateLimitPerMinute: entitlement.rate_limit_per_minute,
        status: entitlement.status,
        validUntil: entitlement.valid_until,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export const verifyPaymentAndActivate = verifyPaymentAndActivateEntitlement;

/**
 * Handles incoming Razorpay webhooks with raw body signature verification and idempotency.
 */
export async function processRazorpayWebhook(firstArg, secondArg, thirdArg) {
  let rawBody, signatureHeader, eventPayload;
  if (typeof firstArg === "object" && firstArg !== null && !Buffer.isBuffer(firstArg)) {
    ({ rawBody, signatureHeader, eventPayload } = firstArg);
  } else {
    rawBody = firstArg;
    signatureHeader = secondArg;
    eventPayload = thirdArg || (rawBody ? JSON.parse(rawBody.toString("utf8")) : {});
  }

  const effectiveWebhookSecret = env.razorpayWebhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!effectiveWebhookSecret) {
    console.warn("[Razorpay Webhook] Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.");
    throw new ApiError(503, "Razorpay webhook secret is not configured.");
  }

  // 1. Verify signature against raw request body
  const expectedSignature = crypto
    .createHmac("sha256", effectiveWebhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signatureHeader) {
    throw new ApiError(400, "Invalid Razorpay webhook signature.");
  }

  const eventId = eventPayload.event_id || eventPayload.id || `evt_${Date.now()}`;
  const eventType = eventPayload.event;

  // 2. Audit event into payment_events with idempotency
  try {
    const eventRes = await pool.query(
      `
      INSERT INTO payment_events (provider, event_id, event_type, payload, status)
      VALUES ('razorpay', $1, $2, $3, 'processed')
      ON CONFLICT (event_id) DO NOTHING
      RETURNING id;
      `,
      [eventId, eventType, JSON.stringify(eventPayload)]
    );

    if (eventRes.rows.length === 0) {
      // Event already recorded and processed
      return { success: true, duplicate: true };
    }
  } catch (err) {
    console.error("Could not record payment_event:", err.message);
  }

  // 3. Process payment.captured or order.paid
  if (eventType === "payment.captured" || eventType === "order.paid") {
    const paymentEntity = eventPayload.payload?.payment?.entity;
    const rzpOrderId = paymentEntity?.order_id;
    const rzpPaymentId = paymentEntity?.id;

    if (rzpOrderId && rzpPaymentId) {
      const orderQuery = await pool.query(
        "SELECT id, user_id, status FROM payment_orders WHERE razorpay_order_id = $1;",
        [rzpOrderId]
      );
      const order = orderQuery.rows[0];

      if (order && order.status !== "paid") {
        // Fetch user email
        const userRes = await pool.query("SELECT email, name FROM users WHERE id = $1;", [order.user_id]);
        const user = userRes.rows[0];

        // Perform server-side entitlement activation
        await verifyPaymentAndActivateEntitlement({
          userId: order.user_id,
          userEmail: user?.email,
          userName: user?.name,
          orderId: order.id,
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: rzpPaymentId,
          razorpaySignature: crypto
            .createHmac("sha256", env.razorpayKeySecret || "")
            .update(`${rzpOrderId}|${rzpPaymentId}`)
            .digest("hex"),
        }).catch((err) => {
          console.error("[Razorpay Webhook] Entitlement activation failed:", err.message);
        });
      } else if (!order) {
        // Check certificate_payment_orders to fulfill internship certificate payments
        const certOrderQuery = await pool.query(
          "SELECT id, user_id, status FROM certificate_payment_orders WHERE razorpay_order_id = $1;",
          [rzpOrderId]
        );
        const certOrder = certOrderQuery.rows[0];
        if (certOrder && certOrder.status !== "paid") {
          const { verifyCertificatePayment } = await import("./certificate.service.js");
          const effectiveSecret = env.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "";
          const certSig = crypto
            .createHmac("sha256", effectiveSecret)
            .update(`${rzpOrderId}|${rzpPaymentId}`)
            .digest("hex");

          await verifyCertificatePayment({
            userId: certOrder.user_id,
            razorpayOrderId: rzpOrderId,
            razorpayPaymentId: rzpPaymentId,
            razorpaySignature: certSig,
          }).catch((err) => {
            console.error("[Razorpay Webhook] Certificate payment verification failed:", err.message);
          });
        }
      }
    }
  }

  // 4. Process payment.failed to update order state and allow retry
  if (eventType === "payment.failed") {
    const paymentEntity = eventPayload.payload?.payment?.entity;
    const rzpOrderId = paymentEntity?.order_id;
    if (rzpOrderId) {
      await pool.query(
        "UPDATE certificate_payment_orders SET status = 'failed', updated_at = NOW() WHERE razorpay_order_id = $1 AND status != 'paid';",
        [rzpOrderId]
      ).catch(() => {});
      await pool.query(
        `UPDATE internship_certificate_eligibility SET status = 'payment_failed', updated_at = NOW()
         WHERE id = (SELECT eligibility_id FROM certificate_payment_orders WHERE razorpay_order_id = $1)
         AND status != 'issued' AND status != 'paid';`,
        [rzpOrderId]
      ).catch(() => {});
    }
  }

  return { success: true, processed: true };
}
