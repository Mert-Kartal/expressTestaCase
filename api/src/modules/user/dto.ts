import z from "zod";

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  googleId: z.string(),
  picture: z.string(),
});

export const idSchema = z.string().uuid();
