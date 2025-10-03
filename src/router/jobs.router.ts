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
import { getGameEmailController, sendApplicationUserController, sendContactEmailController } from "../controllers/sendEmail.controllers";
import helmet from "helmet";

const jobRouter = Router();

jobRouter.post("/", ensureNameJobExists, createJobController);
jobRouter.get("/", getAllJobsController);
jobRouter.get("/:id", ensureJobExists, getJobByIdController);
jobRouter.patch("/:id", ensureJobExists,ensureNameJobExists, updateJobController);
jobRouter.patch("/:id/deactivate", ensureJobExists, deactivateJobController);
jobRouter.post(
  "/:id/apply",
  helmet({ crossOriginResourcePolicy: false }), // Aplica o Helmet
  
  sendApplicationUserController 
);
jobRouter.post("/user-info",getGameEmailController );
jobRouter.post("/contact" ,sendContactEmailController);
export default jobRouter;
