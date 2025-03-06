import { z } from "zod";
import { userSchema } from "../schemas/user.schemas";

export type UserType = z.infer<typeof userSchema>;
