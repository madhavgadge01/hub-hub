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

export const revokeApiKey = async(req,res)=>{
  const { id } = req.params;
  const userId = req.user.id;
  const result = await pool.query(
  `
  UPDATE api_keys
  SET revoked_at = NOW()
  WHERE id = $1
    AND user_id = $2
  RETURNING id, name, key_prefix, revoked_at
  `,
  [id, userId]
);

const resultRow = result.rows[0];
if(!resultRow){
  throw new ApiError(401,"result not faoud");
}
return res.status(200).json({
  success:true
})
}