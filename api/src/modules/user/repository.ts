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
