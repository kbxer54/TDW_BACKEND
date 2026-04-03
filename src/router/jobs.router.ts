import { Router } from "express";
import {
  createJobController,
  getAllJobsController,
  getJobByIdController,
  updateJobController,
  deactivateJobController,
} from "../controllers/jobs.controllers";
import { ensureJobExists } from "../middlewares/ensureJobExist.middleware";
import { ensureJobTitleAvailable } from "../middlewares/ensureJobTitleAvailable.middleware";
import { ensureDataIsValid } from "../middlewares/ensureDataIsValid.middleware";
import {
  applicationEmailSchema,
  contactEmailSchema,
  getGameSchema,
} from "../schemas/aplication.schemas";
import {
  getGameEmailController,
  sendApplicationUserController,
  sendContactEmailController,
} from "../controllers/email.controllers";
import helmet from "helmet";
import { limiter } from "../middlewares/basedSecurity.middleware";
import { ensureJobIsActive } from "../middlewares/ensureJobIsActived.middleware";
import { jobSchemaRequest } from "../schemas/job.schemas";

const jobRouter = Router();

jobRouter.post(
  "/",
  ensureDataIsValid(jobSchemaRequest),
  ensureJobTitleAvailable,
  createJobController,
);
jobRouter.get("/", getAllJobsController);
jobRouter.get("/:id", ensureJobExists, getJobByIdController);
jobRouter.patch(
  "/:id",
  ensureDataIsValid(jobSchemaRequest.partial()),
  ensureJobExists,
  ensureJobTitleAvailable,
  updateJobController,
);
jobRouter.patch("/:id/deactivate", ensureJobExists, deactivateJobController);

jobRouter.post(
  "/:id/apply",
  helmet({ crossOriginResourcePolicy: false }),
  limiter,
  ensureJobExists,
  ensureJobIsActive,
  ensureDataIsValid(applicationEmailSchema),
  sendApplicationUserController,
);

jobRouter.post(
  "/user-info",
  limiter,
  ensureDataIsValid(getGameSchema),
  getGameEmailController,
);

jobRouter.post(
  "/contact",
  limiter,
  ensureDataIsValid(contactEmailSchema),
  sendContactEmailController,
);

export default jobRouter;
