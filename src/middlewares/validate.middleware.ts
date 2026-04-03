import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";


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