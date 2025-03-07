import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";

import { errorHandler } from "./error";
import { corsOptions, limiter } from "./middlewares/basedSecurity.middleware";
import jobRouter from "./router/jobs.router";


const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cors(corsOptions)); 
app.use("/jobs", jobRouter);

app.use(errorHandler);
export default app;
