import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export type ErrorDetail = {
  field: string;
  message: string;
};

export class AppError extends Error {
  statusCode: number;
  errors?: ErrorDetail[];

  constructor(message: string, statusCode: number = 400, errors?: ErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const formatZodErrors = (error: ZodError): ErrorDetail[] =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation error",
      errors: formatZodErrors(error),
    });
    return;
  }

  console.error(
    "Unhandled error:",
    error instanceof Error ? error.message : "Unknown error",
  );
  response.status(500).json({ message: "Internal server error." });
};
