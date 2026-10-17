import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import pool from '../apps/backend/src/config/db.js';
import { closeRedisClient } from '../apps/backend/src/config/redis.js';
import app from '../apps/backend/src/app.js';
import { generateAccessToken } from '../apps/backend/src/utils/token.js';
import { env } from '../apps/backend/src/config/env.js';

describe('Internship Certificate End-to-End User Journey Tests', () => {
  let server;
  let baseUrl;
  let adminUser;
  let adminToken;
  let candidateUser;
  let candidateToken;
  let otherUser;
  let otherToken;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });

    env.razorpayKeyId = env.razorpayKeyId || 'rzp_test_mock';
    env.razorpayKeySecret = env.razorpayKeySecret || 'test_cert_secret_key_98765';
    env.razorpayWebhookSecret = env.razorpayWebhookSecret || 'test_webhook_secret_54321';

    // 1. Create Admin
    const adminRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ('E2E Admin', $1, 'hashed_pw', 'admin', 'active')
       RETURNING id, name, email, role, status;`,
      [`e2e_admin_${Date.now()}@kruu.online`]
    );
    adminUser = adminRes.rows[0];
    adminToken = generateAccessToken(adminUser);

    // 2. Create Candidate User
    const candRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ('Aarav Sharma', $1, 'hashed_pw', 'user', 'active')
       RETURNING id, name, email, role, status;`,
      [`aarav_${Date.now()}@kruu.online`]
    );
    candidateUser = candRes.rows[0];
    candidateToken = generateAccessToken(candidateUser);

    // 3. Create Another User (for cross-user isolation test)
    const otherRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ('Unauthorized Dev', $1, 'hashed_pw', 'user', 'active')
       RETURNING id, name, email, role, status;`,
      [`other_${Date.now()}@kruu.online`]
    );
    otherUser = otherRes.rows[0];
    otherToken = generateAccessToken(otherUser);
  });

  after(async () => {
    try {
      const ids = [adminUser?.id, candidateUser?.id, otherUser?.id].filter(Boolean);
      if (ids.length > 0) {
        await pool.query('DELETE FROM internship_certificates WHERE user_id = ANY($1::uuid[]);', [ids]);
        await pool.query('DELETE FROM certificate_payment_orders WHERE user_id = ANY($1::uuid[]);', [ids]);
        await pool.query('DELETE FROM internship_certificate_eligibility WHERE user_id = ANY($1::uuid[]);', [ids]);
        await pool.query('DELETE FROM admin_audit_logs WHERE admin_id = ANY($1::uuid[]);', [ids]);
        await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[]);', [ids]);
      }
    } catch (e) {}

    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      server.close();
    }

    try {
      await pool.end();
      await closeRedisClient();
    } catch (e) {}
  });

  test('Step 1: Initially, candidate has no certificate eligibility', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/status`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.eligible, false);
    assert.equal(json.eligibilityStatus, 'not_eligible');
  });

  test('Step 2: Admin marks candidate eligible - Status is strictly "eligible", NOT "issued"', async () => {
    const grantRes = await fetch(`${baseUrl}/api/admin/users/${candidateUser.id}/certificate-eligibility`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programTitle: 'Full-Stack Distributed Systems Internship',
        organizationName: 'Kruu Developer Platform',
        completionDate: '2026-10-15',
        adminNotes: 'Verified completion of production microservices.',
      }),
    });
    assert.equal(grantRes.status, 201);
    const grantData = await grantRes.json();
    assert.equal(grantData.eligibility.status, 'eligible');

    // Check user list in admin - confirms "eligible" badge, not "issued"
    const userDetailRes = await fetch(`${baseUrl}/api/admin/users/${candidateUser.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const userDetail = await userDetailRes.json();
    assert.equal(userDetail.certificateEligibility.status, 'eligible');
    assert.equal(userDetail.certificateRecord, null);
    assert.equal(userDetail.certificatePayment, null);
  });

  test('Step 3: Candidate profile status reveals eligibility, ₹100 fee, but payment.isPaid is false', async () => {
    const statusRes = await fetch(`${baseUrl}/api/certificates/status`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert.equal(statusRes.status, 200);
    const statusJson = await statusRes.json();
    assert.equal(statusJson.eligible, true);
    assert.equal(statusJson.eligibilityStatus, 'eligible');
    assert.equal(statusJson.payment.isPaid, false);
    assert.equal(statusJson.certificate, null);
    assert.equal(statusJson.amountInr, 100);
  });

  test('Step 4: Candidate CANNOT download PDF before verified payment (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/${candidateUser.id}/download`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.match(json.error || json.message, /payment required/i);
  });

  let orderData = null;

  test('Step 5: Candidate clicks Pay ₹100: Initiates real ₹100 Razorpay order (10000 paise)', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert.equal(res.status, 200);
    orderData = await res.json();
    assert.equal(orderData.alreadyPaid, false);
    assert.equal(orderData.amount, 10000);
    assert.equal(orderData.amountInr, 100);
    assert.equal(orderData.currency, 'INR');
    assert.ok(orderData.razorpayOrderId);
    assert.ok(orderData.orderId);
  });

  test('Step 6: Payment verification with forged signature is strictly rejected (400)', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/verify-payment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: 'pay_hacked_payment',
        razorpaySignature: 'forged_tampered_signature_sha256',
      }),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.match(json.error, /invalid digital signature/i);

    // Verify still unpaid in DB
    const orderCheck = await pool.query('SELECT status FROM certificate_payment_orders WHERE id = $1', [orderData.orderId]);
    assert.equal(orderCheck.rows[0].status, 'created');
  });

  test('Step 7: Valid cryptographic signature verification succeeds, marks order paid, and issues certificate', async () => {
    const paymentId = `pay_rzp_real_${Date.now()}`;
    const payload = `${orderData.razorpayOrderId}|${paymentId}`;
    const signature = crypto
      .createHmac('sha256', env.razorpayKeySecret)
      .update(payload)
      .digest('hex');

    const res = await fetch(`${baseUrl}/api/certificates/verify-payment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      }),
    });

    assert.equal(res.status, 200);
    const verifyData = await res.json();
    assert.equal(verifyData.success, true);
    assert.ok(verifyData.certificateNumber.startsWith('KRUU-CERT-'));
    assert.ok(verifyData.verificationCode.startsWith('V-'));
  });

  test('Step 8: Candidate profile now shows "issued", verified payment, and unique certificate details', async () => {
    const statusRes = await fetch(`${baseUrl}/api/certificates/status`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert.equal(statusRes.status, 200);
    const statusJson = await statusRes.json();
    assert.equal(statusJson.eligible, true);
    assert.equal(statusJson.eligibilityStatus, 'issued');
    assert.equal(statusJson.payment.isPaid, true);
    assert.ok(statusJson.certificate.id);
    assert.ok(statusJson.certificate.certificateNumber);
    assert.ok(statusJson.certificate.verificationCode);
  });

  test('Step 9: Candidate can download authentic vector PDF certificate', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/${candidateUser.id}/download`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/pdf');
    const buffer = Buffer.from(await res.arrayBuffer());
    assert.equal(buffer.slice(0, 5).toString('ascii'), '%PDF-');
    assert.ok(buffer.length > 1000);
  });

  test('Step 10: Repeated downloads succeed without re-charging (idempotent permanent download)', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/${candidateUser.id}/download`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/pdf');
  });

  test('Step 11: Cross-user attack: Unauthorized user cannot download candidate certificate (403)', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/${candidateUser.id}/download`, {
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.match(json.error, /own certificate/i);
  });

  test('Step 12: Admin panel now accurately reflects "issued" status and verified ₹100 payment', async () => {
    const userDetailRes = await fetch(`${baseUrl}/api/admin/users/${candidateUser.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const userDetail = await userDetailRes.json();
    assert.equal(userDetail.certificateRecord.issue_status, 'issued');
    assert.equal(userDetail.certificatePayment.payment_status, 'paid');
    assert.ok(userDetail.certificateRecord.certificate_number);

    // Check certificate list endpoint
    const certListRes = await fetch(`${baseUrl}/api/admin/certificates`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const certList = await certListRes.json();
    const candidateCert = certList.certificates.find((c) => c.userId === candidateUser.id);
    assert.ok(candidateCert);
    assert.equal(candidateCert.status, 'issued');
    assert.equal(candidateCert.payment_status, 'paid');
  });

  test('Step 13: Public verification endpoint confirms genuine certificate', async () => {
    const certRes = await pool.query(
      'SELECT verification_code, certificate_number FROM internship_certificates WHERE user_id = $1;',
      [candidateUser.id]
    );
    const cert = certRes.rows[0];

    const verifyRes = await fetch(`${baseUrl}/api/certificates/verify/${cert.verification_code}`);
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.valid, true);
    assert.equal(verifyData.certificate.userName, candidateUser.name);
    assert.equal(verifyData.certificate.certificateNumber, cert.certificate_number);
  });
});
