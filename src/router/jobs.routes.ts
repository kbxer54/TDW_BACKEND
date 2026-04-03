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
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { validateSchema } from "../middlewares/validate.middleware";
import { getGameEmailController, sendApplicationUserController, sendContactEmailController } from "../controllers/sendEmail.controllers";
import { limiter } from "../middlewares/basedSecurity.middleware";
import { jobSchemaRequest } from "../schemas/job.schemas";
import { applyJobSchema, contactSchema } from "../schemas/email.schemas";
import { Role } from "../enums/role";

const jobRouter = Router();

jobRouter.get("/", getAllJobsController);
jobRouter.get("/:id", ensureJobExists, getJobByIdController);

jobRouter.post(
  "/", 
  authMiddleware, 
  roleMiddleware([Role.ADMIN, Role.DEVELOPER, Role.LEADER]), 
  validateSchema(jobSchemaRequest), 
  ensureNameJobExists, 
  createJobController
);

jobRouter.patch(
  "/:id", 
  authMiddleware, 
  roleMiddleware([Role.ADMIN, Role.DEVELOPER, Role.LEADER]), 
  ensureJobExists, 
  validateSchema(jobSchemaRequest.partial()), 
  updateJobController
);

jobRouter.patch(
  "/:id/deactivate", 
  authMiddleware, 
  roleMiddleware([Role.ADMIN, Role.DEVELOPER, Role.LEADER]), 
  ensureJobExists, 
  deactivateJobController
);

jobRouter.post(
  "/:id/apply",
  limiter, 
  ensureJobExists, 
  validateSchema(applyJobSchema),
  sendApplicationUserController 
);

jobRouter.post(
  "/contact", 
  limiter, 
  validateSchema(contactSchema),
  sendContactEmailController
);

jobRouter.post(
  "/user-info", 
  limiter, 
  getGameEmailController
);

export default jobRouter;