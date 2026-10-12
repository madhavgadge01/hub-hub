import { test, describe, after, before } from "node:test";
import assert from "node:assert/strict";
import pool from "../apps/backend/src/config/db.js";
import {
  queuePurchaseConfirmationEmail,
  getEmailOutboxStatus,
} from "../apps/backend/src/services/email.service.js";

describe("Brevo Email Outbox & Notification Idempotency Tests", () => {
  let testUserId = null;
  const testPurchaseRef = `pur_test_${Date.now()}`;

  before(async () => {
    const userRes = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ('Email Tester', $1, 'hash')
      RETURNING id;
      `,
      [`emailtest_${Date.now()}@hubhub.dev`]
    );
    testUserId = userRes.rows[0].id;
  });

  after(async () => {
    await pool.query("DELETE FROM email_outbox WHERE recipient_email LIKE '%@hubhub.dev';");
    if (testUserId) {
      await pool.query("DELETE FROM users WHERE id = $1;", [testUserId]);
    }
    await pool.end();
  });

  test("Queues purchase confirmation email with honest config_missing status when Brevo credentials unconfigured", async () => {
    const result = await queuePurchaseConfirmationEmail({
      userId: testUserId,
      recipientEmail: "tester@hubhub.dev",
      recipientName: "Email Tester",
      productName: "Dynamic QR Code Engine",
      planName: "Developer Pro Plan",
      amountPaidFormatted: "499.00",
      currency: "INR",
      purchaseReference: testPurchaseRef,
    });

    assert.ok(result.id);
    assert.equal(result.recipientEmail, "tester@hubhub.dev");
    assert.equal(result.templateType, "purchase_confirmation");

    // Wait brief tick for the asynchronous outbox dispatcher to execute
    await new Promise((r) => setTimeout(r, 60));

    // Verify outbox record in database has honest status config_missing (or sent if test key configured)
    const outboxRecord = await getEmailOutboxStatus(testPurchaseRef, "purchase_confirmation");
    assert.ok(outboxRecord);
    assert.equal(outboxRecord.referenceId, testPurchaseRef);
    assert.equal(outboxRecord.templateType, "purchase_confirmation");
    assert.ok(["config_missing", "sent"].includes(outboxRecord.status));
  });

  test("Idempotency: Repeated notifications for same purchase reference do not produce duplicates", async () => {
    // Attempt second queue call with identical purchaseReference
    const duplicateAttempt = await queuePurchaseConfirmationEmail({
      userId: testUserId,
      recipientEmail: "tester@hubhub.dev",
      recipientName: "Email Tester",
      productName: "Dynamic QR Code Engine",
      planName: "Developer Pro Plan",
      amountPaidFormatted: "499.00",
      currency: "INR",
      purchaseReference: testPurchaseRef,
    });

    // Should return existing record with duplicate skipped
    assert.equal(duplicateAttempt.referenceId, testPurchaseRef);

    // Verify exactly one row in PostgreSQL email_outbox for this reference
    const res = await pool.query(
      `SELECT COUNT(*)::int AS count FROM email_outbox WHERE reference_id = $1 AND template_type = 'purchase_confirmation';`,
      [testPurchaseRef]
    );
    assert.equal(res.rows[0].count, 1, "Must never insert duplicate outbox records for same purchase");
  });
});
