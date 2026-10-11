import QRCode from "qrcode";
import { ApiError } from "../utils/apiError.js";

/**
 * Service to generate QR codes in dataURL (PNG) or SVG string formats.
 */
export async function generateQrCode({
  text,
  format = "png",
  size = 300,
  margin = 2,
  errorCorrectionLevel = "M",
}) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new ApiError(400, "Text or URL content is required for QR code generation.");
  }

  const validLevels = ["L", "M", "Q", "H"];
  const level = validLevels.includes(errorCorrectionLevel?.toUpperCase())
    ? errorCorrectionLevel.toUpperCase()
    : "M";

  const width = Math.min(Math.max(parseInt(size, 10) || 300, 64), 2048);
  const padding = Math.min(Math.max(parseInt(margin, 10) || 2, 0), 20);

  const options = {
    errorCorrectionLevel: level,
    margin: padding,
    width,
  };

  if (format.toLowerCase() === "svg") {
    const svgString = await QRCode.toString(text, { ...options, type: "svg" });
    return {
      text,
      format: "svg",
      content: svgString,
      size: width,
      errorCorrectionLevel: level,
    };
  }

  // Default to PNG Data URL
  const dataUrl = await QRCode.toDataURL(text, options);
  return {
    text,
    format: "png",
    dataUrl,
    size: width,
    errorCorrectionLevel: level,
  };
}
