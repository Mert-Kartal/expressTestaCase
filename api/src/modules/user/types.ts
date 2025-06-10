import { z } from "zod";
import { createUserSchema } from "./dto";

export type CreateUser = z.infer<typeof createUserSchema>;
