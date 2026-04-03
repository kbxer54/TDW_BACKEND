import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

/*
English explanation here
A generic middleware that intercepts the request and validates the body against a provided Zod schema. If validation fails, it passes the error to the global errorHandler in src/error.ts, protecting the backend from malformed payloads.
Explicação em português aqui
Um middleware genérico que intercepta a requisição e valida o corpo contra um schema Zod fornecido. Se a validação falhar, ele passa o erro para o errorHandler global em src/error.ts, protegendo o back-end de cargas úteis malformadas.
*/

export const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};