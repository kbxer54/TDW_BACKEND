import { Request, Response, NextFunction } from "express";

type PublicCacheOptions = {
  maxAgeSeconds: number;
  staleWhileRevalidateSeconds?: number;
};

type CachedPayload = {
  body: unknown;
  expiresAt: number;
  statusCode: number;
};

const MAX_CACHE_ENTRIES = 200;
const responseCache = new Map<string, CachedPayload>();

const setCacheHeaders = (
  response: Response,
  { maxAgeSeconds, staleWhileRevalidateSeconds }: Required<PublicCacheOptions>,
): void => {
  response.set(
    "Cache-Control",
    [
      "public",
      `max-age=${maxAgeSeconds}`,
      `s-maxage=${maxAgeSeconds}`,
      `stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    ].join(", "),
  );
};

const saveCachePayload = (
  key: string,
  payload: CachedPayload,
): void => {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;

    if (oldestKey) {
      responseCache.delete(oldestKey);
    }
  }

  responseCache.set(key, payload);
};

export const publicCache =
  ({
    maxAgeSeconds,
    staleWhileRevalidateSeconds = maxAgeSeconds,
  }: PublicCacheOptions) =>
  (request: Request, response: Response, next: NextFunction): void => {
    if (request.method !== "GET") {
      next();
      return;
    }

    if (request.headers.authorization) {
      response.set("Cache-Control", "no-store");
      next();
      return;
    }

    const cacheOptions = { maxAgeSeconds, staleWhileRevalidateSeconds };
    const cacheKey = `${request.method}:${request.originalUrl}`;
    const cachedPayload = responseCache.get(cacheKey);

    setCacheHeaders(response, cacheOptions);

    if (cachedPayload && cachedPayload.expiresAt > Date.now()) {
      response.set("X-Cache", "HIT");
      response.status(cachedPayload.statusCode).json(cachedPayload.body);
      return;
    }

    response.set("X-Cache", "MISS");
    const originalJson = response.json.bind(response);

    response.json = ((body: unknown) => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        saveCachePayload(cacheKey, {
          body,
          statusCode: response.statusCode,
          expiresAt: Date.now() + maxAgeSeconds * 1000,
        });
      }

      return originalJson(body);
    }) as Response["json"];

    next();
  };

export const noStore = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  response.set("Cache-Control", "no-store");
  next();
};
