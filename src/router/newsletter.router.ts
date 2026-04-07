import { Router } from "express";
import helmet from "helmet";
import { unsubscribeNewsletterController } from "../controllers/newsletter.controllers";
import { limiter } from "../middlewares/basedSecurity.middleware";
import { ensureDataIsValid } from "../middlewares/ensureDataIsValid.middleware";
import { newsletterUnsubscribeSchema } from "../schemas/newsletter.schemas";

const newsletterRouter = Router();

newsletterRouter.post(
  "/unsubscribe",
  helmet({ crossOriginResourcePolicy: false }),
  limiter,
  ensureDataIsValid(newsletterUnsubscribeSchema),
  unsubscribeNewsletterController,
);

export default newsletterRouter;
