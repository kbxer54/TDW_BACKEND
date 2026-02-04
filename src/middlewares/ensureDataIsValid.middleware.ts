import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

const ensureDataIsValid =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    // O .parse() vai lançar um erro se os dados forem inválidos
    // O seu app.ts já tem um errorHandler para capturar isso (ZodError)
    const validatedData = schema.parse(req.body);

    // Substitui o corpo da requisição pelos dados limpos/validados
    req.body = validatedData;

    return next();
  };

export { ensureDataIsValid };
