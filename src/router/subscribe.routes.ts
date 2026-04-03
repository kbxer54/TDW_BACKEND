import { Router } from "express";
import { SubscribeController } from "../controllers/subscribeController";
import { subscribeLimiter } from "../middlewares/rateLimit";
import { validateSchema } from "../middlewares/validate.middleware";
import { subscribeSchema } from "../schemas/subscribe.schemas";

const subscribeRouter = Router();
const subscribeController = new SubscribeController();

subscribeRouter.post(
  "/", 
  subscribeLimiter, 
  validateSchema(subscribeSchema), 
  subscribeController.handle
);

export default subscribeRouter;