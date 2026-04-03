import { z } from "zod";
import { loginSchema, registerSchema } from "../schemas/auth.schemas";
import { Role } from "../enums/role";

export type TRegisterRequest = z.infer<typeof registerSchema>;
export type TLoginRequest = z.infer<typeof loginSchema>;

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  token: string;
}