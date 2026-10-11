import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.accessTokenSecret,
    {
      expiresIn: env.accessTokenExpiry,
    }
  );
}

export function generateRefreshToken(user, sessionId) {
  return jwt.sign(
    {
      userId: user.id,
      sessionId,
    },
    env.refreshTokenSecret,
    {
      expiresIn: env.refreshTokenExpiry,
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.accessTokenSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshTokenSecret);
}
