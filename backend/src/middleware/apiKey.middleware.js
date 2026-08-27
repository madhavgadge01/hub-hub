import bcrypt from "bcrypt";
import pool from "../models/db.js";
import { ApiError } from "../utils/api.error.js";

export const verifyApiKey = async(req,res,next)=>{
const rawApiKey = req.headers["x-api-key"];
if(!rawApiKey){
    throw new ApiError(401,"XApi key is missing");

}

  const keyPrefix = rawApiKey.slice(0, 16);

const result = await pool.query(
  `
  SELECT id, user_id, name, key_prefix, key_hash, revoked_at

  FROM api_keys
  WHERE key_prefix = $1
  `,
  [keyPrefix]
);



const apiKeyRecord = result.rows[0];
if (!apiKeyRecord) {
  throw new ApiError(401, "Invalid API key");
}

if (apiKeyRecord.revoked_at) {
  throw new ApiError(401, "API key revoked");
}
const keyVerify = await bcrypt.compare(
  rawApiKey,
  apiKeyRecord.key_hash
);

if (!keyVerify) {
  throw new ApiError(401, "Invalid API key");
}
await pool.query(
  `
UPDATE api_keys
SET last_used_at = NOW()
WHERE id =$1
  `,
  [apiKeyRecord.id]
);

req.apiKey = {
  id: apiKeyRecord.id,
  userId: apiKeyRecord.user_id,
  name: apiKeyRecord.name
};

next();

}