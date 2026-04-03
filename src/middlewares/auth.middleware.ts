import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

/*
Middleware to verify if the incoming request has a valid JWT token.
Extracts the user ID and Role from the token and injects them into the request object.

Middleware para verificar se a requisição recebida possui um token JWT válido.
Extrai o ID do usuário e o Cargo do token e os injeta no objeto da requisição.
*/

interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Extend the Request type dynamically or via a custom typing file (express.d.ts)
    (req as any).user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};