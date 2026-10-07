import bcrypt from "bcrypt";
import pool from "../models/db.js"
import crypto from "crypto";
import { ApiError } from "../utils/api.error.js";


export const createApiKey = async (req, res) => {
  const{ name }=req.body;
  if(!name){
    throw new ApiError(400,"name requied")
  }


  
  const userId = req.user.id
const randomPart = crypto.randomBytes(24).toString("hex");
  const rawApiKey = `dh_live_${randomPart}`;
  const keyPrefix = rawApiKey.slice(0, 16);

  const apiKeyHash = await bcrypt.hash(rawApiKey,16);

const apiKeyResult = await pool.query(
  `
  INSERT INTO api_keys (
    user_id,
    name,
    key_prefix,
    key_hash
  )
  VALUES ($1, $2, $3, $4)
  RETURNING id, name, key_prefix, created_at
  `,
  [userId, name, keyPrefix, apiKeyHash]
);
const createdApiKey = apiKeyResult.rows[0];

return res.status(201).json({
     success: true,
  message: "API key created successfully",
    apiKey: {
    id: createdApiKey.id,
    name: createdApiKey.name,
    keyPrefix: createdApiKey.key_prefix,
    key: rawApiKey,
    createdAt: createdApiKey.created_at
  }
})


}