import { Request, Response, NextFunction } from "express";
import { AppError } from "../error";
import { AccountRole, RequestWithAuth } from "../interface/auth.interfaces";

export const roleMiddleware =
  (allowedRoles: AccountRole[]) =>
  (request: RequestWithAuth, response: Response, next: NextFunction) => {
    if (!request.authAccount) {
      throw new AppError("Authentication required", 401);
    }

    if (!allowedRoles.includes(request.authAccount.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }

    return next();
  };
