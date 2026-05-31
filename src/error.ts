import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { MulterError } from "multer";
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

type HttpErrorLike = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
};

const getHttpErrorStatus = (error: Error): number | null => {
  const httpError = error as HttpErrorLike;
  const statusCode = httpError.statusCode || httpError.status;

  if (
    typeof statusCode === "number" &&
    statusCode >= 400 &&
    statusCode < 600
  ) {
    return statusCode;
  }

  return null;
};

const getHttpErrorMessage = (error: Error, statusCode: number): string => {
  const httpError = error as HttpErrorLike;

  if (httpError.type === "entity.parse.failed") {
    return "Invalid JSON payload";
  }

  if (statusCode === 413) {
    return "Request payload too large";
  }

  if (statusCode === 400) {
    return "Bad request";
  }

  return "Request error";
};

const getRequestId = (response: Response): string | undefined => {
  const requestId = response.locals.requestId;

  return typeof requestId === "string" ? requestId : undefined;
};

const requestContext = (request: Request, response: Response) => ({
  requestId: getRequestId(response),
  method: request.method,
  path: request.originalUrl,
});

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const requestId = getRequestId(response);

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      console.error("Application error:", {
        ...requestContext(request, response),
        statusCode: error.statusCode,
        message: error.message,
      });
    }

    response.status(error.statusCode).json({
      message: error.message,
      ...(requestId ? { requestId } : {}),
      ...(error.errors ? { errors: error.errors } : {}),
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation error",
      ...(requestId ? { requestId } : {}),
      errors: formatZodErrors(error),
    });
    return;
  }

  if (error instanceof MulterError) {
    const messageByCode: Record<string, string> = {
      LIMIT_FILE_SIZE: "One or more files exceed the allowed size",
      LIMIT_FILE_COUNT: "Too many files uploaded",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field",
    };

    response.status(400).json({
      message: messageByCode[error.code] || "File upload error",
      ...(requestId ? { requestId } : {}),
      errors: [
        {
          field: error.field || "images",
          message: messageByCode[error.code] || error.message,
        },
      ],
    });
    return;
  }

  const httpErrorStatus = getHttpErrorStatus(error);

  if (httpErrorStatus) {
    if (httpErrorStatus >= 500) {
      console.error("HTTP error:", {
        ...requestContext(request, response),
        statusCode: httpErrorStatus,
        message: error.message,
      });
    }

    response.status(httpErrorStatus).json({
      message: getHttpErrorMessage(error, httpErrorStatus),
      ...(requestId ? { requestId } : {}),
    });
    return;
  }

  console.error("Unhandled error:", {
    ...requestContext(request, response),
    message: error instanceof Error ? error.message : "Unknown error",
  });
  response.status(500).json({
    message: "Internal server error.",
    ...(requestId ? { requestId } : {}),
  });
};
