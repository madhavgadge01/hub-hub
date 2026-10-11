import { generateQrCode } from "../services/qr.service.js";
import { extractUrlMetadata } from "../services/metadata.service.js";
import { validateJson } from "../services/jsonValidator.service.js";
import { formatOrMinifyJson } from "../services/jsonFormatter.service.js";
import {
  validateCard,
  checkPasswordStrength,
  generateRandomPassword,
} from "../services/devTools.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. QR Code Generator
export const handleQrCode = asyncHandler(async (req, res) => {
  const { text, format, size, margin, errorCorrectionLevel } = req.body;
  const result = await generateQrCode({
    text: text || req.body.url,
    format,
    size,
    margin,
    errorCorrectionLevel,
  });

  res.status(200).json({
    success: true,
    message: "QR code generated successfully.",
    data: result,
    // Backward compatibility aliases
    qrDataUrl: result.dataUrl,
    text: result.text,
  });
});

// 2. URL Metadata Extractor
export const handleUrlMetadata = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const metadata = await extractUrlMetadata(url);

  res.status(200).json({
    success: true,
    message: "Metadata extracted successfully.",
    data: metadata,
  });
});

// 3. JSON Validator
export const handleJsonValidator = asyncHandler(async (req, res) => {
  const input = req.body.json !== undefined ? req.body.json : req.body.input || req.body;
  const validation = validateJson(input);

  res.status(200).json({
    success: true,
    message: validation.valid ? "JSON validation passed." : "JSON validation failed.",
    data: validation,
  });
});

// 4. JSON Formatter & Minifier
export const handleJsonFormatter = asyncHandler(async (req, res) => {
  const { json, input, action, indent } = req.body;
  const target = json !== undefined ? json : input;
  const result = formatOrMinifyJson({
    input: target,
    action: action || "format",
    indent: indent || 2,
  });

  res.status(200).json({
    success: true,
    message: `JSON successfully ${result.action === "minify" ? "minified" : "formatted"}.`,
    data: result,
  });
});

// 5. Credit Card Validator
export const handleCardValidator = asyncHandler(async (req, res) => {
  const cardNumber = req.body.cardNumber || req.body.Cardnumber;
  const result = validateCard(cardNumber);

  res.status(200).json({
    success: true,
    data: result,
    // Backward compatibility fields
    isValid: result.valid,
    cardType: result.cardType,
    masked: result.masked,
  });
});

// 6. Cryptographic Password Generator
export const handlePasswordGenerator = asyncHandler(async (req, res) => {
  const { length, hasNumbers, hasSymbols, hasUppercase, hasLowercase } = req.body;
  const result = generateRandomPassword({
    length,
    hasNumbers,
    hasSymbols,
    hasUppercase,
    hasLowercase,
  });

  res.status(200).json({
    success: true,
    data: result,
    password: result.password,
    length: result.length,
  });
});

// 7. Password Strength Checker
export const handlePasswordChecker = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const result = checkPasswordStrength(password);

  res.status(200).json({
    success: true,
    data: result,
    score: result.score,
    strength: result.strength,
  });
});
