import {
  getUserByGoogleId,
  addUser,
  updateUserRefreshToken,
  getUserByRefreshToken,
  clearUserRefreshToken,
  getUserById,
  updateUserRole,
  getAllUsers,
} from "./repository";
import { CreateUser } from "./types";
import { generateTokenPair } from "../../utils/auth";
import { AppError } from "../../utils/appError";

export const createUser = async (data: CreateUser) => {
  const existUser = await getUserByGoogleId(data.googleId);
  if (existUser) {
    const { accessToken, refreshToken } = generateTokenPair(
      existUser.id,
      existUser.role
    );

    await updateUserRefreshToken(existUser.id, refreshToken);

    return {
      ...existUser,
      accessToken,
      refreshToken,
      message: "user logged in successfully",
    };
  }
  const createdUser = await addUser(data);
  const { accessToken, refreshToken } = generateTokenPair(
    createdUser.id,
    createdUser.role
  );

  await updateUserRefreshToken(createdUser.id, refreshToken);

  return {
    ...createdUser,
    accessToken,
    refreshToken,
    message: "user signed up successfully",
  };
};

export const findUserByRefreshToken = async (refreshToken: string) => {
  return await getUserByRefreshToken(refreshToken);
};

export const updateRefreshToken = async (
  userId: string,
  refreshToken: string
) => {
  return await updateUserRefreshToken(userId, refreshToken);
};

export const removeRefreshToken = async (userId: string) => {
  return await clearUserRefreshToken(userId);
};

export const logoutUser = async (refreshToken: string) => {
  const user = await getUserByRefreshToken(refreshToken);
  if (user) {
    await clearUserRefreshToken(user.id);
    return { success: true, message: "User logged out successfully" };
  }
  throw new AppError("User not found", 404);
};

export const findUser = async (id: string) => {
  return await getUserById(id);
};

export const setUserRole = async (
  userId: string,
  role: "STUDENT" | "TEACHER"
) => {
  return await updateUserRole(userId, role);
};

export const findUsers = async () => {
  return await getAllUsers();
};
