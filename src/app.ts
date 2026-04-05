import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import { errorHandler } from "./error";
import { corsOptions } from "./middlewares/basedSecurity.middleware";
import authRouter from "./router/auth.router";
import jobRouter from "./router/jobs.router";
import publicationRouter from "./router/publications.router";
import subscribeRouter from "./router/subscribe.router";

const publicationStaticDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "publications",
);

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions)); 
app.use("/auth", authRouter);
app.use("/jobs", jobRouter);
app.use("/publications", publicationRouter);
app.use("/subscribe", subscribeRouter);
app.use(
  "/uploads/publications",
  express.static(publicationStaticDirectory),
);

app.use(errorHandler);
export default app;
