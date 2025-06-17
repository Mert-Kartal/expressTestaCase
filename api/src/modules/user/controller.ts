import { Request, Response, NextFunction } from "express";
import { findUsers, findUser } from "./service";
import { AppError } from "../../utils/appError";
import { Id } from "./types";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await findUsers();
    res.status(200).json(users);
  } catch (error: any) {
    next(new AppError("Failed to get users", 500));
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUser(req.user.id);
    res.status(200).json(user);
  } catch (error: any) {
    next(new AppError("Failed to get user", 500));
  }
};

export const getUserById = async (
  req: Request<{ id: Id }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUser(req.params.id);
    res.status(200).json(user);
  } catch (error: any) {
    next(new AppError("Failed to get user", 500));
  }
};
