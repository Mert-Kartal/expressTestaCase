import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { accessTokenSecret } from "../config/data";

export interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Yetkisiz: Token eksik." });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token, accessTokenSecret);

    req.user = decoded as { id: string; role: string };
    next();
  } catch (error) {
    res.status(401).json({ message: "Yetkisiz: Token eksik." });
    return;
  }
};
