import crypto from "crypto";
import { ApiError } from "../utils/apiError.js";

/**
 * Validates credit card number with Luhn algorithm and detects card issuer brand.
 */
export function validateCard(rawNumber) {
  if (!rawNumber || typeof rawNumber !== "string") {
    throw new ApiError(400, "Card number string is required.");
  }

  const cleanNumber = rawNumber.replace(/[\s-]/g, "");
  if (!/^\d+$/.test(cleanNumber)) {
    throw new ApiError(400, "Card number must contain digits only.");
  }

  if (cleanNumber.length < 12 || cleanNumber.length > 19) {
    return {
      valid: false,
      cardType: "Unknown",
      luhnCheck: false,
      lengthValid: false,
      masked: "Invalid Length",
      message: "Card length must be between 12 and 19 digits.",
    };
  }

  let cardType = "Unknown";
  if (cleanNumber.startsWith("4")) {
    cardType = "Visa";
  } else if (/^5[1-5]/.test(cleanNumber) || /^2(?:2[2-9]|[3-6]\d|7[01]|720)/.test(cleanNumber)) {
    cardType = "Mastercard";
  } else if (cleanNumber.startsWith("34") || cleanNumber.startsWith("37")) {
    cardType = "American Express";
  } else if (cleanNumber.startsWith("6011") || cleanNumber.startsWith("65")) {
    cardType = "Discover";
  } else if (/^(508[5-9]|652[1-2]|606[1-9]|607[0-9]|608[0-4])/.test(cleanNumber)) {
    cardType = "RuPay";
  }

  // Luhn algorithm verification
  let sum = 0;
  let isAlternate = false;
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);
    if (isAlternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isAlternate = !isAlternate;
  }

  const isValid = sum % 10 === 0;
  const masked = cleanNumber.length > 8
    ? `${cleanNumber.slice(0, 4)} **** **** ${cleanNumber.slice(-4)}`
    : "****";

  return {
    valid: isValid,
    cardType,
    length: cleanNumber.length,
    lengthValid: true,
    luhnCheck: isValid,
    masked,
    message: isValid ? "Card passed Luhn validation." : "Invalid card number checksum.",
  };
}

/**
 * Analyzes password strength and Shannon entropy.
 */
export function checkPasswordStrength(password) {
  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password string is required.");
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const minLength = password.length >= 8;

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 33;
  if (poolSize === 0) poolSize = 1;

  const entropy = Math.round(password.length * Math.log2(poolSize) * 10) / 10;

  let score = 0;
  if (hasLower) score++;
  if (hasUpper) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;
  if (minLength) score++;

  let strength = "Weak";
  let crackTimeDisplay = "< 1 second";

  if (entropy > 80 && password.length >= 14) {
    strength = "Very Strong";
    crackTimeDisplay = "2.4 million years";
  } else if (entropy > 60 && password.length >= 10) {
    strength = "Strong";
    crackTimeDisplay = "140 years";
  } else if (entropy > 40 && password.length >= 8) {
    strength = "Medium";
    crackTimeDisplay = "3 days";
  } else if (entropy > 25) {
    strength = "Weak";
    crackTimeDisplay = "2 minutes";
  }

  return {
    score,
    strength,
    entropyBits: entropy,
    crackTimeDisplay,
    checks: {
      hasLowercase: hasLower,
      hasUppercase: hasUpper,
      hasNumbers: hasNumber,
      hasSymbols: hasSymbol,
      minLengthPassed: minLength,
    },
  };
}

/**
 * Generates cryptographic random password.
 */
export function generateRandomPassword({
  length = 24,
  hasNumbers = true,
  hasSymbols = true,
  hasUppercase = true,
  hasLowercase = true,
}) {
  const len = Math.min(Math.max(parseInt(length, 10) || 24, 6), 128);

  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const NUM = "0123456789";
  const SYM = "!@#$%^&*()_+~|}{[]:;?><,./-=";

  let charset = "";
  const guaranteed = [];

  if (hasUppercase) {
    charset += UPPER;
    guaranteed.push(UPPER[crypto.randomInt(0, UPPER.length)]);
  }
  if (hasLowercase) {
    charset += LOWER;
    guaranteed.push(LOWER[crypto.randomInt(0, LOWER.length)]);
  }
  if (hasNumbers) {
    charset += NUM;
    guaranteed.push(NUM[crypto.randomInt(0, NUM.length)]);
  }
  if (hasSymbols) {
    charset += SYM;
    guaranteed.push(SYM[crypto.randomInt(0, SYM.length)]);
  }

  if (charset.length === 0) {
    charset = LOWER + NUM;
  }

  const chars = [...guaranteed];
  while (chars.length < len) {
    chars.push(charset[crypto.randomInt(0, charset.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  const finalPassword = chars.join("");
  return {
    password: finalPassword,
    length: finalPassword.length,
    entropy: Math.round(finalPassword.length * Math.log2(charset.length) * 10) / 10,
  };
}
