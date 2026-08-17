import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool from "../models/db.js"
import crypto from "crypto";
import { ApiError } from "../utils/api.error.js";
import { generateAccessToken } from "../utils/token.js";
import { generateRefreshToken } from "../utils/token.js";


import { setAuthCookies,clearAuthCookies } from "../utils/cookies.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Enter email and password");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Find user
  const result = await pool.query(
    `
    SELECT id, name, email, password_hash
    FROM users
    WHERE email = $1
    `,
    [normalizedEmail]
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 2. Verify password
  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 3. Generate session id before creating refresh token
  const sessionId = crypto.randomUUID();

  // 4. Generate tokens
  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(
    user,
    sessionId
  );

  // 5. Hash refresh token before saving it
  const refreshTokenHash = await bcrypt.hash(
    refreshToken,
    10
  );


  await pool.query(
    `
    INSERT INTO sessions (
      id,
      user_id,
      refresh_token_hash,
      expires_at
    )
    VALUES (
      $1,
      $2,
      $3,
      NOW() + INTERVAL '7 days'
    )
    `,
    [
      sessionId,
      user.id,
      refreshTokenHash
    ]
  );


  setAuthCookies(
    res,
    accessToken,
    refreshToken
  );


  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
};

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    // 1. Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 2. Find session
    const sessionResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        refresh_token_hash,
        expires_at,
        revoked_at
      FROM sessions
      WHERE id = $1
        AND user_id = $2
      `,
      [decoded.sessionId, decoded.userId]
    );

    const session = sessionResult.rows[0];

    if (!session) {
      throw new ApiError(401, "Invalid session");
    }

    // 3. Check revoked session
    if (session.revoked_at) {
      throw new ApiError(401, "Session revoked");
    }

    // 4. Check session expiry
    if (new Date(session.expires_at) < new Date()) {
      throw new ApiError(401, "Session expired");
    }

    // 5. Make sure hash exists
    if (!session.refresh_token_hash) {
      throw new ApiError(401, "Invalid session");
    }

    // 6. Compare refresh token with stored hash
    const isValidRefreshToken = await bcrypt.compare(
      refreshToken,
      session.refresh_token_hash
    );

    if (!isValidRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // 7. Fetch user
    const userResult = await pool.query(
      `
      SELECT id, name, email
      FROM users
      WHERE id = $1
      `,
      [decoded.userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // 8. Generate new access token
    const newAccessToken = generateAccessToken(user);

    // 9. Set new access-token cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired");
    }

    throw error;
  }
};

export const logout = async(req,res)=>{
    const refreshToken = req.cookies?.refreshToken;
    if(!refreshToken){
    throw new ApiError(401, "Refresh token missing");
}
    const decoded = jwt.verify(
      refreshToken,
  process.env.REFRESH_TOKEN_SECRET
    )

      const sessionRevoke = await pool.query( `
     UPDATE sessions
     SET revoked_at = NOW()
     WHERE id = $1`,
     [decoded.sessionId]
);

clearAuthCookies(res);

return res.status(200).json({
  success: true,
  message: "Logged out successfully"
});
  }

export const registerUser = async (req, res) => {
 const {name ,email,password}= req.body;
if(!name ||!email||!password){
        return res.status(400).json({
            success: false,
        message: "Name, email and password are required",
        })
    }

    const normalizedName = name.trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = email.trim().toLowerCase();
    const userExist = await pool.query(
        "SELECT ID FROM users WHERE email =$1",[normalizedEmail])
        
        



if(userExist.rows.length > 0){
    return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
}
   
const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        email,
        created_at
      `,
      [normalizedName, normalizedEmail, hashedPassword]
    );

    const createdUser = result.rows[0];
     return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: createdUser,
    });


}





export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};
