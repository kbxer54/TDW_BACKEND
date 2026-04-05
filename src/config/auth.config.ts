import { SignOptions } from "jsonwebtoken";
import { AppError } from "../error";

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new AppError("Authentication service is not configured", 500);
  }

  return secret;
};

export const getJwtExpiresIn = (): SignOptions["expiresIn"] =>
  (process.env.JWT_EXPIRES_IN?.trim() || "7d") as SignOptions["expiresIn"];
