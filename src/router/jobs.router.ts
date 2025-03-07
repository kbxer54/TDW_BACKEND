import { Router } from "express";
import {
  createJobController,
  getAllJobsController,
  getJobByIdController,
  updateJobController,
  deactivateJobController,
} from "../controllers/jobs.controllers";
import { ensureJobExists } from "../middlewares/ensureJobExist.middleware";
import { ensureNameJobExists } from "../middlewares/ensureNameJobExist.middleware";
import { sendApplicationUserController, sendContactEmailController } from "../controllers/sendEmail.controllers";
import helmet from "helmet";
import { limiter } from "../middlewares/basedSecurity.middleware";

const jobRouter = Router();

jobRouter.post("/", ensureNameJobExists, createJobController);
jobRouter.get("/", getAllJobsController);
jobRouter.get("/:id", ensureJobExists, getJobByIdController);
jobRouter.patch("/:id", ensureJobExists,ensureNameJobExists, updateJobController);
jobRouter.patch("/:id/deactivate", ensureJobExists, deactivateJobController);
jobRouter.post(
  "/:id/apply",
  helmet({ crossOriginResourcePolicy: false }), // Aplica o Helmet
  limiter, // Aplica o Rate Limiter
  ensureJobExists, // Middleware existente
  sendApplicationUserController // Controller de envio de email
);
jobRouter.post("/contact",limiter ,sendContactEmailController);
export default jobRouter;
