import QRCode from "qrcode";
import { ApiError } from "../utils/api.error.js";
import pool from "../models/db.js"

export const pingTool = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API key verified",
    apiKey: req.apiKey,
  });
};


export const getApiKeys = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw new ApiError(401, "User id required");
  }

  const result = await pool.query(
    `
    SELECT
      id,
      name,
      key_prefix,
      created_at,
      last_used_at,
      revoked_at
    FROM api_keys
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return res.status(200).json({
    success: true,
    message: "Get API keys success",
    apiKeys: result.rows
  });
};

export const generateQr = async(req,res)=>{
  const { text } = req.body;
  if (!text) {
  throw new ApiError(400, "Text is required");
}
  console.log(text);
  const qrDataUrl = await QRCode.toDataURL(text);

  if(!qrDataUrl){
    throw new ApiError(401,"qrDataUrl error ::tool controller.js")
  }
  return res.status(200).json({
    success: true,
    message: "qr code generated",
    qrDataUrl,text

  })

}