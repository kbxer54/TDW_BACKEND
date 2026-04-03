import { Router } from "express";
import helmet from "helmet";
import { subscribeController } from "../controllers/subscribe.controllers";
import { limiter } from "../middlewares/basedSecurity.middleware";
import { ensureDataIsValid } from "../middlewares/ensureDataIsValid.middleware";
import { subscribeSchema } from "../schemas/subscribe.schemas";

const subscribeRouter = Router();

subscribeRouter.post(
  "/",
  helmet({ crossOriginResourcePolicy: false }),
  limiter,
  ensureDataIsValid(subscribeSchema),
  subscribeController,
);

export default subscribeRouter;
