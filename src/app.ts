import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet"; // IMPORTANTE: Instale via 'npm install helmet' se ainda não fez

import { errorHandler } from "./error";
import { corsOptions } from "./middlewares/basedSecurity.middleware";
import jobRouter from "./router/jobs.routes";
import subscribeRouter from "./router/subscribe.routes";
import broadcastRouter from "./router/broadcast.routes";
import authRouter from "./router/auth.routes";

const app = express();
app.set("trust proxy", 1);

app.use(helmet()); 
app.use(express.json());
app.use(cors(corsOptions)); 

app.use("/jobs", jobRouter);
app.use("/subscribe", subscribeRouter);
app.use("/broadcast", broadcastRouter);
app.use("/auth", authRouter);

app.use(errorHandler);
export default app;