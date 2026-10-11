import { ApiError } from "../utils/apiError.js";

/**
 * Service to format (prettify) or minify JSON payloads.
 */
export function formatOrMinifyJson({ input, action = "format", indent = 2 }) {
  if (input === undefined || input === null) {
    throw new ApiError(400, "JSON content is required.");
  }

  let rawString = typeof input === "string" ? input : JSON.stringify(input);

  if (rawString.trim().length === 0) {
    throw new ApiError(400, "JSON string cannot be empty.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawString);
  } catch (err) {
    throw new ApiError(400, `Malformed JSON: ${err.message}`);
  }

  const originalBytes = Buffer.byteLength(rawString, "utf-8");
  let resultString;

  if (action === "minify") {
    resultString = JSON.stringify(parsed);
  } else {
    const spaces = typeof indent === "number" ? Math.min(Math.max(indent, 1), 8) : 2;
    resultString = JSON.stringify(parsed, null, spaces);
  }

  const resultBytes = Buffer.byteLength(resultString, "utf-8");
  const bytesDifference = originalBytes - resultBytes;
  const savingsPercent = originalBytes > 0
    ? Math.round((bytesDifference / originalBytes) * 1000) / 10
    : 0;

  return {
    action,
    result: resultString,
    originalBytes,
    resultBytes,
    bytesSaved: Math.max(bytesDifference, 0),
    savingsPercent: action === "minify" ? savingsPercent : null,
  };
}
