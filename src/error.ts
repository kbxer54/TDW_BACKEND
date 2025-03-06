import { Request, Response, NextFunction, ErrorRequestHandler } from "express";  
import { ZodError } from "zod";  

export class AppError extends Error {  
  statusCode: number;  
  constructor(message: string, statusCode: number = 400) {  
    super(message);  
    this.statusCode = statusCode;  
  }  
}  

export const errorHandler: ErrorRequestHandler = (  
  error: Error,  
  request: Request,  
  response: Response,  
  next: NextFunction  
): void => {  
  if (error instanceof AppError) {  
    response.status(error.statusCode).json({ message: error.message });  
    return; // Retorna vazio  
  }  
  if (error instanceof ZodError) {  
    response.status(400).json({ message: error.flatten().fieldErrors });  
    return; // Retorna vazio  
  }  
  console.error(error);  
  response.status(500).json({ message: "Internal Server Error." });  
}; 