import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateQrCode } from "../apps/backend/src/services/qr.service.js";
import { validateJson } from "../apps/backend/src/services/jsonValidator.service.js";
import { formatOrMinifyJson } from "../apps/backend/src/services/jsonFormatter.service.js";
import { validateSafeUrl } from "../apps/backend/src/utils/ssrf.js";
import {
  validateCard,
  checkPasswordStrength,
  generateRandomPassword,
} from "../apps/backend/src/services/devTools.service.js";

describe("Core Developer Utilities Unit Tests", () => {
  test("QR Code Generator produces valid dataURL and SVG", async () => {
    const pngResult = await generateQrCode({
      text: "https://hubhub.dev",
      format: "png",
      size: 200,
    });
    assert.equal(pngResult.format, "png");
    assert.ok(pngResult.dataUrl.startsWith("data:image/png;base64,"));

    const svgResult = await generateQrCode({
      text: "https://hubhub.dev",
      format: "svg",
      size: 200,
    });
    assert.equal(svgResult.format, "svg");
    assert.ok(svgResult.content.includes("<svg"));
  });

  test("JSON Validator accepts valid JSON and computes depth/keys", () => {
    const sample = JSON.stringify({
      name: "Hub&Hub",
      features: ["auth", "ratelimit", "utilities"],
      nested: { level: 2 },
    });
    const result = validateJson(sample);
    assert.equal(result.valid, true);
    assert.equal(result.type, "object");
    assert.ok(result.depth >= 2);
    assert.ok(result.totalKeys >= 3);
  });

  test("JSON Validator reports syntax errors with line and column", () => {
    const badJson = '{\n  "title": "Hub",\n  "unclosed": \n}';
    const result = validateJson(badJson);
    assert.equal(result.valid, false);
    assert.ok(result.error);
    assert.ok(result.line !== null);
  });

  test("JSON Formatter formats and minifies with byte savings", () => {
    const raw = '{"a":1,"b":[2,3],"c":{"d":4}}';
    const formatted = formatOrMinifyJson({ input: raw, action: "format", indent: 2 });
    assert.ok(formatted.result.includes("\n  "));
    assert.ok(formatted.resultBytes > formatted.originalBytes);

    const minified = formatOrMinifyJson({ input: formatted.result, action: "minify" });
    assert.equal(minified.result, raw);
    assert.ok(minified.bytesSaved > 0);
    assert.ok(minified.savingsPercent > 0);
  });

  test("SSRF Protection blocks localhost, 127.0.0.1, private IPs, and non-http", async () => {
    await assert.rejects(
      async () => validateSafeUrl("http://localhost:8000"),
      /restricted/i
    );
    await assert.rejects(
      async () => validateSafeUrl("http://127.0.0.1:8000/api"),
      /restricted/i
    );
    await assert.rejects(
      async () => validateSafeUrl("http://192.168.1.1/secret"),
      /forbidden/i
    );
    await assert.rejects(
      async () => validateSafeUrl("ftp://example.com/file"),
      /Only HTTP and HTTPS/i
    );
  });

  test("Credit Card Validator performs Luhn verification and detects brand", () => {
    // Valid Visa test number
    const visa = validateCard("4532 7189 2837 1928");
    assert.equal(visa.cardType, "Visa");

    // Invalid number
    const invalid = validateCard("4532 7189 2837 1929");
    assert.equal(invalid.valid, false);
  });

  test("Password generator & strength checker", () => {
    const generated = generateRandomPassword({ length: 24 });
    assert.equal(generated.length, 24);
    assert.ok(generated.entropy > 80);

    const check = checkPasswordStrength("Tr0ub4dor&3_Secure99!");
    assert.ok(check.score >= 4);
    assert.equal(check.checks.minLengthPassed, true);
  });
});
