import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { accessTokenSecret, refreshTokenSecret } from "../config/data";
dotenv.config();

// JWT Payload interfaces
export interface AccessTokenPayload {
  id: string;
  role: string;
}
export interface RefreshTokenPayload {
  id: string;
}
export const generateAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string, secret: string) => {
  const decoded = jwt.verify(token, secret);
  return decoded;
};

export const decodeGoogleIdToken = (id_token: string) => {
  const decoded = jwt.decode(id_token);
  return decoded;
};
