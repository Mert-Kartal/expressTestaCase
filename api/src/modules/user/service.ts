import {
  getUserByGoogleId,
  addUser,
  updateUserRefreshToken,
  getUserByRefreshToken,
  clearUserRefreshToken,
} from "./repository";
import { CreateUser } from "./types";
import { generateAccessToken, generateRefreshToken } from "../../utils/auth";

export const createUser = async (data: CreateUser) => {
  const user = await getUserByGoogleId(data.googleId);
  if (!!user) {
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Refresh token'ı DB'ye kaydet
    await updateUserRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
      message: "user logged in successfully",
    };
  }
  const createdUser = await addUser(data);
  const accessToken = generateAccessToken({
    id: createdUser.id,
    role: createdUser.role,
  });
  const refreshToken = generateRefreshToken({ id: createdUser.id });

  // Refresh token'ı DB'ye kaydet
  await updateUserRefreshToken(createdUser.id, refreshToken);

  return {
    user: createdUser,
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
  return { success: false, message: "User not found" };
};
