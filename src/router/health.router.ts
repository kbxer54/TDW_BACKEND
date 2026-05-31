import { Router } from "express";
import {
  healthCheckController,
  readinessCheckController,
} from "../controllers/health.controllers";
import { noStore } from "../middlewares/cache.middleware";

const healthRouter = Router();

healthRouter.get("/", noStore, healthCheckController);
healthRouter.get("/live", noStore, healthCheckController);
healthRouter.get("/ready", noStore, readinessCheckController);

export default healthRouter;
