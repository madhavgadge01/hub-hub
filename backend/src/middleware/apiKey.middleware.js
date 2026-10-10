import bcrypt from "bcrypt";
import pool from "../models/db.js";
import rateLimit from 'express-rate-limit';


import redis from "../config/redis.js"
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
const rateLimitKey = `rate_limit:${apiKeyRecord.id}`;

const requestCount = await redis.incr(rateLimitKey)
if(requestCount===1){
  await redis.expire(rateLimitKey, 60);
}

if (requestCount > 60) {
  throw new ApiError(429, "Rate limit exceeded");
}

await pool.query(
  `
UPDATE api_keys
SET last_used_at = NOW()
WHERE id =$1
  `,
  [apiKeyRecord.id]
);




await pool.query(`INSERT into api_usage(
  api_key_id,
user_id,
endpoint,
method
  )VALUES(
  $1,
  $2,
  $3,
  $4)`,[
    apiKeyRecord.id,
    apiKeyRecord.user_id,
    req.originalUrl,
    req.method
  ]);

req.apiKey = {
  id: apiKeyRecord.id,
  userId: apiKeyRecord.user_id,
  name: apiKeyRecord.name
};

next();

}


export const createLinkLimiter = rateLimit({
     windowMs: 1 * 60 * 1000,
   
    max: 20,
    message: {
        success: false,
        message: "Bhai, thoda aaram se! 1 minute mein max 20 links hi bana sakte ho. Thodi der baad try karo."
    },
    standardHeaders: true,
    legacyHeaders: false,
});