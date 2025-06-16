import { NextFunction, Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";
import { errorResponse } from "../utils/response";

export const errorHandler = (
  error: Error | AppError | ZodError | PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // AppError handling
  if (error instanceof AppError) {
    const response = errorResponse(error.message);
    res.status(error.statusCode).json(response);
    return;
  }

  // Zod validation error
  if (error instanceof ZodError) {
    const response = errorResponse("Validation error", error.errors);
    res.status(422).json(response);
    return;
  }

  // Prisma error
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        const response1 = errorResponse("Unique constraint violation");
        res.status(400).json(response1);
        return;
      case "P2025":
        const response2 = errorResponse("Record not found");
        res.status(404).json(response2);
        return;
      default:
        const response3 = errorResponse("Database error");
        res.status(500).json(response3);
        return;
    }
  }

  // Default error
  const response = errorResponse("Internal server error");

  res.status(500).json(response);
  return;
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  const response = errorResponse(`Route ${req.originalUrl} not found`);
  res.status(404).json(response);
};
