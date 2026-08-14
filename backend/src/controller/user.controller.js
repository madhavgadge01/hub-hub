import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../middleware/API.error.js";
import pool from "../models/db.js"
import { generateAccessToken } from "../utils/token.js";
import { generateRefreshToken } from "../utils/token.js";
import cookieParser from "cookie-parser";
import { setAuthCookies } from "../utils/cookies.js";
export const registerUser = async (req, res) => {
 const {name ,email,password}= req.body;
if(!name ||!email||!password){
        return res.status(400).json({
            success: false,
        message: "Name, email and password are required",
        })
    }

    const normallizedName = name.trim();
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
    const hashedPassword = await bcrypt.hash(password, 10);
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

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Enter email and password");
  }

  const normalizedEmail = email.trim().toLowerCase();

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

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const sessionResult = await pool.query(
    `
    INSERT INTO sessions (
      user_id,
      expires_at
    )
    VALUES ($1, NOW() + INTERVAL '7 days')
    RETURNING id
    `,
    [user.id]
  );

  const sessionId = sessionResult.rows[0].id;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, sessionId);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await pool.query(
    `
    UPDATE sessions
    SET refresh_token_hash = $1
    WHERE id = $2
    `,
    [refreshTokenHash, sessionId]
  );

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};