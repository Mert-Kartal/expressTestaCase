import prisma from "../../config/db";
import { CreateUser } from "./types";

export const addUser = async (data: CreateUser) => {
  return await prisma.user.create({
    data: { ...data, role: "STUDENT" },
  });
};

export const getUserByGoogleId = async (googleId: string) => {
  return await prisma.user.findUnique({
    where: {
      googleId,
    },
  });
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const updateUserRefreshToken = async (
  userId: string,
  refreshToken: string
) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken,
    },
  });
};

export const getUserByRefreshToken = async (refreshToken: string) => {
  return await prisma.user.findFirst({
    where: {
      refreshToken,
    },
  });
};

export const clearUserRefreshToken = async (userId: string) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: null,
    },
  });
};

export const updateUserRole = async (
  userId: string,
  role: "STUDENT" | "TEACHER"
) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
      isRoleSet: true,
    },
  });
};
