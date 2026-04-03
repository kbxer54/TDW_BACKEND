import { Request, Response, NextFunction } from "express";

/*
Middleware to check if the authenticated user has the required role to access a route.
Must be used after the authMiddleware.

Middleware para verificar se o usuário autenticado tem o cargo necessário para acessar uma rota.
Deve ser usado após o authMiddleware.
*/
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }

    return next();
  };
};