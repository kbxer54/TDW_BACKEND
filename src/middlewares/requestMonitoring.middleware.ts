import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

const SLOW_REQUEST_THRESHOLD_MS = 1000;

const getRequestId = (request: Request): string => {
  const requestIdHeader = request.headers["x-request-id"];

  if (typeof requestIdHeader === "string" && requestIdHeader.trim()) {
    return requestIdHeader.trim().slice(0, 100);
  }

  return randomUUID();
};

export const requestMonitoring = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const startedAt = Date.now();
  const requestId = getRequestId(request);

  response.locals.requestId = requestId;
  response.setHeader("X-Request-Id", requestId);

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;

    if (
      response.statusCode < 400 &&
      durationMs < SLOW_REQUEST_THRESHOLD_MS
    ) {
      return;
    }

    const logPayload = {
      requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs,
    };

    if (response.statusCode >= 500) {
      console.error("Request failed:", logPayload);
      return;
    }

    if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
      console.warn("Request was slow:", logPayload);
      return;
    }

    console.warn("Request completed with client error:", logPayload);
  });

  next();
};
