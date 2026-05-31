import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import { errorHandler } from "./error";
import { corsOptions } from "./middlewares/basedSecurity.middleware";
import { requestMonitoring } from "./middlewares/requestMonitoring.middleware";
import authRouter from "./router/auth.router";
import healthRouter from "./router/health.router";
import jobRouter from "./router/jobs.router";
import newsletterRouter from "./router/newsletter.router";
import publicationRouter from "./router/publications.router";
import subscribeRouter from "./router/subscribe.router";

const publicationStaticDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "publications",
);

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(requestMonitoring);
app.use(express.json({ limit: "1mb" }));
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/jobs", jobRouter);
app.use("/publications", publicationRouter);
app.use("/subscribe", subscribeRouter);
app.use("/newsletter", newsletterRouter);
app.use(
  "/uploads/publications",
  express.static(publicationStaticDirectory, {
    immutable: true,
    maxAge: "7d",
  }),
);

app.use((request, response) => {
  const requestId = response.locals.requestId;

  response.status(404).json({
    message: "Route not found",
    ...(typeof requestId === "string" ? { requestId } : {}),
  });
});

app.use(errorHandler);
export default app;
