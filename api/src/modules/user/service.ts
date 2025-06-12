import { getUserByGoogleId, addUser } from "./repository";
import { CreateUser } from "./types";
import { generateAccessToken, generateRefreshToken } from "../../utils/auth";

export const createUser = async (data: CreateUser) => {
  const user = await getUserByGoogleId(data.googleId);
  if (!!user) {
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
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

  return {
    user: createdUser,
    accessToken,
    refreshToken,
    message: "user signed up successfully",
  };
};
