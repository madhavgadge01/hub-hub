import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import pool from '../apps/backend/src/config/db.js';
import { closeRedisClient } from '../apps/backend/src/config/redis.js';
import app from '../apps/backend/src/app.js';
import { generateAccessToken } from '../apps/backend/src/utils/token.js';
import { env } from '../apps/backend/src/config/env.js';

describe('Admin Control Center, Analytics & Secure Internship Certificate System Tests', () => {
  let server;
  let baseUrl;

  let adminUser = null;
  let adminToken = null;

  let regularUser = null;
  let regularToken = null;

  let studentUser = null;
  let studentToken = null;

  let hackerUser = null;
  let hackerToken = null;

  before(async () => {
    // 1. Start ephemeral test HTTP server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Configure test secrets for cryptographic signatures
    env.razorpayKeyId = env.razorpayKeyId || 'rzp_test_mock';
    env.razorpayKeySecret = env.razorpayKeySecret || 'test_cert_razorpay_secret_12345';

    // 2. Insert test Admin user
    const adminRes = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ('Super Admin', $1, 'hashed_pw', 'admin', 'active')
      RETURNING id, name, email, role, status;
      `,
      [`admin_test_${Date.now()}@kruu.online`]
    );
    adminUser = adminRes.rows[0];
    adminToken = generateAccessToken(adminUser);

    // 3. Insert regular user
    const regRes = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ('Regular Dev', $1, 'hashed_pw', 'user', 'active')
      RETURNING id, name, email, role, status;
      `,
      [`regular_test_${Date.now()}@kruu.online`]
    );
    regularUser = regRes.rows[0];
    regularToken = generateAccessToken(regularUser);

    // 4. Insert student user (for certificate workflow)
    const studentRes = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ('Student Learner', $1, 'hashed_pw', 'user', 'active')
      RETURNING id, name, email, role, status;
      `,
      [`student_test_${Date.now()}@kruu.online`]
    );
    studentUser = studentRes.rows[0];
    studentToken = generateAccessToken(studentUser);

    // 5. Insert hacker user (for cross-user attack tests)
    const hackerRes = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ('Malicious Actor', $1, 'hashed_pw', 'user', 'active')
      RETURNING id, name, email, role, status;
      `,
      [`hacker_test_${Date.now()}@kruu.online`]
    );
    hackerUser = hackerRes.rows[0];
    hackerToken = generateAccessToken(hackerUser);
  });

  after(async () => {
    try {
      const userIds = [adminUser?.id, regularUser?.id, studentUser?.id, hackerUser?.id].filter(Boolean);
      if (userIds.length > 0) {
        await pool.query('DELETE FROM internship_certificates WHERE user_id = ANY($1::uuid[]);', [userIds]);
        await pool.query('DELETE FROM certificate_payment_orders WHERE user_id = ANY($1::uuid[]);', [userIds]);
        await pool.query('DELETE FROM internship_certificate_eligibility WHERE user_id = ANY($1::uuid[]);', [userIds]);
        await pool.query('DELETE FROM admin_audit_logs WHERE admin_id = ANY($1::uuid[]);', [userIds]);
        await pool.query('DELETE FROM api_keys WHERE user_id = ANY($1::uuid[]);', [userIds]);
        await pool.query('DELETE FROM sessions WHERE user_id = ANY($1::uuid[]);', [userIds]);
        await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[]);', [userIds]);
      }
    } catch (e) {
      // Ignore cleanup error
    }

    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      server.close();
    }

    try {
      await pool.end();
      await closeRedisClient();
    } catch (e) {
      // Ignore teardown close errors
    }
  });

  // ==========================================
  // SECTION 1: STRICT ADMIN AUTHORIZATION TESTS
  // ==========================================
  describe('1. Strict Admin Authorization & Security Enforcement', () => {
    test('Unauthenticated user cannot access admin dashboard (401)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`);
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.ok(json.error || json.message);
    });

    test('Regular authenticated user (role=user) cannot access admin dashboard (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${regularToken}` },
      });
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.match(json.error || json.message, /administrator privileges|forbidden|access denied/i);
    });

    test('Regular user cannot access admin user list (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${regularToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Regular user cannot access admin audit logs (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${regularToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Authorized admin can access dashboard with real DB telemetry (200)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.ok(json.overview);
      assert.ok(json.overview.users);
      assert.ok(json.overview.apis);
      assert.ok(json.overview.payments);
      assert.ok(json.overview.certificates);
      assert.ok(json.overview.systemHealth);
      assert.equal(json.overview.systemHealth.database.connected, true);
    });
  });

  // ==========================================
  // SECTION 2: USER MANAGEMENT & SUSPENSION
  // ==========================================
  describe('2. User Management, Account Suspension & Audit Trail', () => {
    test('Admin can list and search users', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users?search=${regularUser.email}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.ok(Array.isArray(json.users));
      assert.ok(json.users.some((u) => u.id === regularUser.id));
    });

    test('Admin can inspect full user detail with 7-tab telemetry', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users/${regularUser.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.user.id, regularUser.id);
      assert.ok(Array.isArray(json.purchases));
      assert.ok(Array.isArray(json.apiKeys));
      assert.ok(json.stats);
    });

    test('Admin can suspend a user and suspension immediately blocks authenticated user', async () => {
      // 1. Suspend regular user
      const suspendRes = await fetch(`${baseUrl}/api/admin/users/${regularUser.id}/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'suspended', reason: 'Security terms violation test' }),
      });
      assert.equal(suspendRes.status, 200);

      // 2. Verify status changed in DB
      const dbCheck = await pool.query('SELECT status, suspended_reason FROM users WHERE id = $1', [regularUser.id]);
      assert.equal(dbCheck.rows[0].status, 'suspended');
      assert.equal(dbCheck.rows[0].suspended_reason, 'Security terms violation test');

      // 3. User makes request with their existing token -> should be rejected with 403
      const blockedRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${regularToken}` },
      });
      assert.equal(blockedRes.status, 403);
      const blockedJson = await blockedRes.json();
      assert.match(blockedJson.error || blockedJson.message, /suspended/i);

      // 4. Verify audit log entry was created
      const auditRes = await pool.query(
        "SELECT * FROM admin_audit_logs WHERE (action = 'user_suspend' OR action = 'USER_STATUS_UPDATED') AND target_id = $1",
        [regularUser.id]
      );
      assert.ok(auditRes.rows.length > 0);
      assert.equal(auditRes.rows[0].admin_id, adminUser.id);

      // 5. Reactivate user
      const reactivateRes = await fetch(`${baseUrl}/api/admin/users/${regularUser.id}/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active', reason: 'Reinstated by admin' }),
      });
      assert.equal(reactivateRes.status, 200);

      // 6. User can access auth endpoint again
      const restoredRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${regularToken}` },
      });
      assert.equal(restoredRes.status, 200);
    });

    test('Admin can revoke a user API key', async () => {
      // Create a test key for student
      const keyRes = await pool.query(
        `
        INSERT INTO api_keys (user_id, key_prefix, key_hash, name)
        VALUES ($1, 'dh_test_', 'hash', 'Test Key to Revoke')
        RETURNING id;
        `,
        [studentUser.id]
      );
      const keyId = keyRes.rows[0].id;

      // Admin revokes key
      const revokeRes = await fetch(`${baseUrl}/api/admin/users/${studentUser.id}/keys/${keyId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(revokeRes.status, 200);

      // Verify key is revoked in DB
      const dbKey = await pool.query('SELECT revoked_at FROM api_keys WHERE id = $1', [keyId]);
      assert.ok(dbKey.rows[0].revoked_at !== null);
    });
  });

  // ==========================================
  // SECTION 3: CERTIFICATE ELIGIBILITY WORKFLOW
  // ==========================================
  describe('3. Internship Certificate Eligibility & Administrative Controls', () => {
    test('Ineligible user checking status receives eligible=false', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/status`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.eligible, false);
      assert.equal(json.eligibilityStatus, 'not_eligible');
    });

    test('Ineligible user attempting to create payment order is rejected (400/403)', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.ok(res.status === 400 || res.status === 403);
      const json = await res.json();
      assert.match(json.error || json.message, /not.*eligible/i);
    });

    test('Ineligible user attempting to download PDF is rejected (403)', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/${studentUser.id}/download`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 403);
    });

    test('Non-admin cannot grant certificate eligibility (403)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users/${studentUser.id}/certificate-eligibility`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${regularToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programTitle: 'Unauthorized Grant' }),
      });
      assert.equal(res.status, 403);
    });

    test('Admin explicitly marks student eligible with verified program details', async () => {
      const grantRes = await fetch(`${baseUrl}/api/admin/users/${studentUser.id}/certificate-eligibility`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programTitle: 'Kruu Developer Internship in Systems Engineering',
          organizationName: 'Kruu Developer Platform',
          completionDate: '2026-10-01',
          adminNotes: 'Verified completion of API marketplace & telemetry tasks.',
        }),
      });
      assert.equal(grantRes.status, 201);
      const grantJson = await grantRes.json();
      assert.equal(grantJson.eligibility.status || grantJson.eligibility.eligibility_status, 'eligible');
      assert.equal(grantJson.eligibility.user_id, studentUser.id);

      // Verify audit log
      const audit = await pool.query(
        "SELECT * FROM admin_audit_logs WHERE action = 'grant_certificate_eligibility' AND target_id = $1",
        [grantJson.eligibility.id]
      );
      assert.ok(audit.rows.length > 0);

      // Student checks status -> now eligible!
      const statusRes = await fetch(`${baseUrl}/api/certificates/status`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(statusRes.status, 200);
      const statusJson = await statusRes.json();
      assert.equal(statusJson.eligible, true);
      assert.equal(statusJson.eligibilityStatus, 'eligible');
      assert.equal(statusJson.programTitle, 'Kruu Developer Internship in Systems Engineering');
      assert.equal(statusJson.amountInr, 100);
    });

    test('Admin can revoke certificate eligibility before issuance', async () => {
      // Create temporary student to test revocation
      const tempRes = await pool.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ('Temp Student', $1, 'hash', 'user') RETURNING id`,
        [`temp_student_${Date.now()}@kruu.online`]
      );
      const tempId = tempRes.rows[0].id;

      // 1. Grant eligibility
      await fetch(`${baseUrl}/api/admin/users/${tempId}/certificate-eligibility`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programTitle: 'Temp Program' }),
      });

      // 2. Revoke eligibility
      const revokeRes = await fetch(`${baseUrl}/api/admin/users/${tempId}/certificate-eligibility/revoke`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Administrative correction' }),
      });
      assert.equal(revokeRes.status, 200);

      // 3. Verify in DB
      const check = await pool.query(
        'SELECT status FROM internship_certificate_eligibility WHERE user_id = $1',
        [tempId]
      );
      assert.equal(check.rows[0].status, 'revoked');

      // Cleanup temp
      await pool.query('DELETE FROM internship_certificate_eligibility WHERE user_id = $1', [tempId]);
      await pool.query('DELETE FROM users WHERE id = $1', [tempId]);
    });
  });

  // ==========================================
  // SECTION 4: CERTIFICATE ₹100 PAYMENT & CRYPTOGRAPHIC VERIFICATION
  // ==========================================
  describe('4. Certificate ₹100 Fee Enforcement & Cryptographic Payment Verification', () => {
    let orderResData = null;

    test('Eligible student initiates certificate payment order: amount is strictly ₹100 (10,000 paise)', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      orderResData = await res.json();
      assert.equal(orderResData.amountInr, 100);
      assert.equal(orderResData.amount, 10000);
      assert.equal(orderResData.currency, 'INR');
      assert.ok(orderResData.orderId);

      // Verify DB order amount is strictly 10000 paise
      const dbOrder = await pool.query(
        'SELECT amount, currency, status FROM certificate_payment_orders WHERE id = $1',
        [orderResData.orderId]
      );
      assert.equal(Number(dbOrder.rows[0].amount), 10000);
      assert.equal(dbOrder.rows[0].currency, 'INR');
      assert.equal(dbOrder.rows[0].status, 'created');
    });

    test('Payment verification with forged/invalid HMAC signature is rejected with 400', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/verify-payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateOrderId: orderResData.orderId,
          razorpayOrderId: orderResData.razorpayOrderId,
          razorpayPaymentId: 'pay_tampered_123',
          razorpaySignature: 'invalid_forged_signature_hex',
        }),
      });
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.match(json.error, /invalid.*signature/i);

      // Certificate must NOT be issued
      const certCheck = await pool.query(
        'SELECT * FROM internship_certificates WHERE user_id = $1',
        [studentUser.id]
      );
      assert.equal(certCheck.rows.length, 0);
    });

    test('Valid cryptographic payment signature completes order and issues unique certificate', async () => {
      const fakePaymentId = `pay_verified_${Date.now()}`;
      const signPayload = `${orderResData.razorpayOrderId}|${fakePaymentId}`;
      const validSignature = crypto
        .createHmac('sha256', env.razorpayKeySecret)
        .update(signPayload)
        .digest('hex');

      const res = await fetch(`${baseUrl}/api/certificates/verify-payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateOrderId: orderResData.orderId,
          razorpayOrderId: orderResData.razorpayOrderId,
          razorpayPaymentId: fakePaymentId,
          razorpaySignature: validSignature,
        }),
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.certificateNumber);
      assert.match(json.certificateNumber, /^KRUU-CERT-/);
      assert.ok(json.verificationCode);

      // Verify DB certificate entry
      const dbCert = await pool.query(
        'SELECT * FROM internship_certificates WHERE user_id = $1',
        [studentUser.id]
      );
      assert.equal(dbCert.rows.length, 1);
      assert.equal(dbCert.rows[0].status, 'valid');
      assert.equal(dbCert.rows[0].certificate_number, json.certificateNumber);
    });

    test('Idempotency: Re-verifying the same order does not duplicate certificate or re-charge', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.alreadyPaid, true);
      assert.ok(json.certificate);

      // Verify no duplicate certificates in DB
      const certCount = await pool.query(
        'SELECT COUNT(*) FROM internship_certificates WHERE user_id = $1',
        [studentUser.id]
      );
      assert.equal(Number(certCount.rows[0].count), 1);
    });
  });

  // ==========================================
  // SECTION 5: SECURE PDF GENERATION & CROSS-USER ISOLATION
  // ==========================================
  describe('5. Secure Certificate PDF Generation & Download Authorization', () => {
    test('Cross-User Attack: Malicious user cannot download student certificate (403)', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/${studentUser.id}/download`, {
        headers: { Authorization: `Bearer ${hackerToken}` },
      });
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.match(json.error, /own certificate/i);
    });

    test('Unauthenticated user cannot download certificate (401)', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/${studentUser.id}/download`);
      assert.equal(res.status, 401);
    });

    test('Paid, eligible student can download authentic PDF certificate', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/${studentUser.id}/download`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'application/pdf');

      const buffer = Buffer.from(await res.arrayBuffer());
      // Check PDF magic bytes '%PDF-'
      const header = buffer.slice(0, 5).toString('ascii');
      assert.equal(header, '%PDF-');
      assert.ok(buffer.length > 500, 'PDF size should be substantial');
    });

    test('Repeated downloads succeed without extra fee', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/${studentUser.id}/download`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'application/pdf');
    });
  });

  // ==========================================
  // SECTION 6: PUBLIC VERIFICATION & CSV EXPORTS
  // ==========================================
  describe('6. Public Verification & Admin CSV Exports', () => {
    test('Public credential verification returns authentic verification data without leaking secrets', async () => {
      // 1. Get certificate code from DB
      const cert = (
        await pool.query('SELECT certificate_number, verification_code FROM internship_certificates WHERE user_id = $1', [
          studentUser.id,
        ])
      ).rows[0];

      // 2. Query public endpoint with verification code
      const res = await fetch(`${baseUrl}/api/certificates/verify/${cert.verification_code}`);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.valid, true);
      assert.equal(json.certificate.userName, studentUser.name);
      assert.equal(json.certificate.certificateNumber, cert.certificate_number);
      assert.equal(json.certificate.programTitle, 'Kruu Developer Internship in Systems Engineering');

      // Ensure no password hash or secrets leaked
      assert.equal(json.certificate.password_hash, undefined);
      assert.equal(json.certificate.secret, undefined);
    });

    test('Public verification with non-existent code returns valid=false', async () => {
      const res = await fetch(`${baseUrl}/api/certificates/verify/NON_EXISTENT_CODE_XYZ`);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.valid, false);
    });

    test('Admin can export CSV reports', async () => {
      const res = await fetch(`${baseUrl}/api/admin/export/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type'), /text\/csv/);
      const text = await res.text();
      assert.match(text, /User ID,Name,Email,Role/);
      assert.match(text, new RegExp(studentUser.email));
    });

    test('Regular user cannot export CSV reports (403)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/export/users`, {
        headers: { Authorization: `Bearer ${regularToken}` },
      });
      assert.equal(res.status, 403);
    });
  });
});
