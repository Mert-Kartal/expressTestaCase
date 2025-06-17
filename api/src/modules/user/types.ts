import { z } from "zod";
import { createUserSchema, idSchema } from "./dto";

export type CreateUser = z.infer<typeof createUserSchema>;
export type Id = z.infer<typeof idSchema>;
