import { Request, Response, NextFunction } from "express";
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

export const optionalAuthMiddleware = async (
  request: RequestWithAuth,
  response: Response,
  next: NextFunction,
) => {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    return next();
  }

  const payload = verifyAuthToken(token);
  request.authAccount = await getAccountProfileService(Number(payload.sub));

  return next();
};
