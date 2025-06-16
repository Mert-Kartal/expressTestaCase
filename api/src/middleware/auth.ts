import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { accessTokenSecret } from "../config/data";
import { AppError } from "../utils/appError";

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
      return next(new AppError("token required", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token, accessTokenSecret);

    req.user = decoded as { id: string; role: string };
    next();
  } catch (error) {
    next(error);
  }
};

export const roleAuthorizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user.role !== "TEACHER") {
    return next(new AppError("unauthorized", 403));
  }
  next();
};
