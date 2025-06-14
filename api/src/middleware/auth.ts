import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { accessTokenSecret } from "../config/data";

declare global {
  namespace Express {
    interface Request {
      user: { id: string; role: string };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "token required" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token, accessTokenSecret);

    req.user = decoded as { id: string; role: string };
    next();
  } catch (error) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }
};
