import { Request, Response, NextFunction } from "express";
import { AppError } from "../error";
import { RequestWithAuth } from "../interface/auth.interfaces";
import { getAccountProfileService, verifyAuthToken } from "../services/auth.services";

const extractBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token.trim();
};

export const authMiddleware = async (
  request: RequestWithAuth,
  response: Response,
  next: NextFunction,
) => {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  const payload = verifyAuthToken(token);
  request.authAccount = await getAccountProfileService(Number(payload.sub));

  return next();
};
