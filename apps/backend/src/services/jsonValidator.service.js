import { ApiError } from "../utils/apiError.js";

/**
 * Helper to calculate depth and element count of parsed JSON.
 */
function analyzeJson(value, currentDepth = 1) {
  if (value === null || typeof value !== "object") {
    return { depth: currentDepth, count: 1, keysCount: 0 };
  }

  let maxDepth = currentDepth;
  let totalElements = 1;
  let totalKeys = 0;

  if (Array.isArray(value)) {
    for (const item of value) {
      const child = analyzeJson(item, currentDepth + 1);
      maxDepth = Math.max(maxDepth, child.depth);
      totalElements += child.count;
      totalKeys += child.keysCount;
    }
  } else {
    const entries = Object.entries(value);
    totalKeys += entries.length;
    for (const [, val] of entries) {
      const child = analyzeJson(val, currentDepth + 1);
      maxDepth = Math.max(maxDepth, child.depth);
      totalElements += child.count;
      totalKeys += child.keysCount;
    }
  }

  return { depth: maxDepth, count: totalElements, keysCount: totalKeys };
}

/**
 * Extracts line and column from a JSON parsing error message or string position.
 */
function getErrorPosition(rawString, errorMessage) {
  // 1. Pattern: "at position 42"
  const posMatch = errorMessage.match(/at position (\d+)/i);
  if (posMatch) {
    const position = parseInt(posMatch[1], 10);
    const beforeError = rawString.slice(0, position);
    const lines = beforeError.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column, position };
  }

  // 2. Pattern: "line 3 column 5"
  const lineColMatch = errorMessage.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
      position: null,
    };
  }

  // 3. Pattern: Unexpected token 'X', "..." is not valid JSON
  const tokenMatch = errorMessage.match(/Unexpected token '([^']+)'/i) || errorMessage.match(/Unexpected token ([^\s,]+)/i);
  if (tokenMatch) {
    const token = tokenMatch[1];
    const idx = rawString.indexOf(token);
    if (idx !== -1) {
      const beforeError = rawString.slice(0, idx);
      const lines = beforeError.split("\n");
      return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
        position: idx,
      };
    }
  }

  // Fallback to line 1 column 1
  return { line: 1, column: 1, position: 0 };
}

/**
 * Validates JSON input, returns structural metrics and syntax error locations.
 */
export function validateJson(input) {
  if (input === undefined || input === null) {
    throw new ApiError(400, "JSON payload is required for validation.");
  }

  let rawString = typeof input === "string" ? input : JSON.stringify(input);

  // Disallow empty input
  if (rawString.trim().length === 0) {
    return {
      valid: false,
      error: "Input string is empty.",
      line: 1,
      column: 1,
      byteSize: 0,
    };
  }

  try {
    const parsed = JSON.parse(rawString);
    const stats = analyzeJson(parsed);
    const type = parsed === null ? "null" : Array.isArray(parsed) ? "array" : typeof parsed;

    return {
      valid: true,
      type,
      byteSize: Buffer.byteLength(rawString, "utf-8"),
      depth: stats.depth,
      totalKeys: stats.keysCount,
      totalNodes: stats.count,
      summary: `Valid JSON ${type} with ${stats.keysCount} keys, depth of ${stats.depth}.`,
    };
  } catch (err) {
    const { line, column, position } = getErrorPosition(rawString, err.message);
    return {
      valid: false,
      error: err.message,
      line,
      column,
      position,
      byteSize: Buffer.byteLength(rawString, "utf-8"),
    };
  }
}
