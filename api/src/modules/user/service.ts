import { getUserByGoogleId, addUser } from "./repository";
import { CreateUser } from "./types";

export const createUser = async (data: CreateUser) => {
  const user = await getUserByGoogleId(data.googleId);
  if (user) {
    return user;
  }
  return await addUser(data);
};
