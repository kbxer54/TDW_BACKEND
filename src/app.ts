import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "./error";
import { corsOptions } from "./middlewares/basedSecurity.middleware";
import jobRouter from "./router/jobs.router";
import subscribeRouter from "./router/subscribe.router";


const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions)); 
app.use("/jobs", jobRouter);
app.use("/subscribe", subscribeRouter);

app.use(errorHandler);
export default app;
