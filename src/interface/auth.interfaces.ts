import { Request } from "express";

export const accountRoles = ["ADMIN", "LEADER", "DEVELOPER"] as const;

export type AccountRole = (typeof accountRoles)[number];

export interface AuthTokenPayload {
  sub: string;
  role: AccountRole;
  email: string;
}

export interface AuthenticatedAccount {
  id: number;
  name: string;
  email: string;
  role: AccountRole;
  createdAt: Date;
  updatedAt: Date;
}

export type RequestWithAuth = Request & {
  authAccount?: AuthenticatedAccount;
};

export type RequestWithRequiredAuth = Request & {
  authAccount: AuthenticatedAccount;
};
