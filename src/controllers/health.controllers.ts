import { Request, Response } from "express";
import { AppDataSource } from "../data-source";

const startedAt = new Date();

const getBaseHealthPayload = (response: Response) => {
  const requestId = response.locals.requestId;

  return {
    status: "ok",
    uptime: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
    timestamp: new Date().toISOString(),
    ...(typeof requestId === "string" ? { requestId } : {}),
  };
};

export const healthCheckController = (
  request: Request,
  response: Response,
): void => {
  response.status(200).json(getBaseHealthPayload(response));
};

export const readinessCheckController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const requestId = response.locals.requestId;

  if (!AppDataSource.isInitialized) {
    response.status(503).json({
      ...getBaseHealthPayload(response),
      status: "not_ready",
      database: "not_initialized",
    });
    return;
  }

  try {
    await AppDataSource.query("SELECT 1");
    response.status(200).json({
      ...getBaseHealthPayload(response),
      status: "ready",
      database: "ok",
    });
  } catch (error) {
    console.error("Readiness check failed:", {
      requestId: typeof requestId === "string" ? requestId : undefined,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    response.status(503).json({
      ...getBaseHealthPayload(response),
      status: "not_ready",
      database: "unavailable",
    });
  }
};
