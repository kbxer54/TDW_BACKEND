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
import { ensureDataIsValid } from "../middlewares/ensureDataIsValid.middleware";
import {
  applicationEmailSchema,
  contactEmailSchema,
} from "../schemas/aplication.schemas";
import {
  getGameEmailController,
  sendApplicationUserController,
  sendContactEmailController,
} from "../controllers/sendEmail.controllers";
import helmet from "helmet";

const jobRouter = Router();

jobRouter.post("/", ensureNameJobExists, createJobController);
jobRouter.get("/", getAllJobsController);
jobRouter.get("/:id", ensureJobExists, getJobByIdController);
jobRouter.patch(
  "/:id",
  ensureJobExists,
  ensureNameJobExists,
  updateJobController,
);
jobRouter.patch("/:id/deactivate", ensureJobExists, deactivateJobController);

jobRouter.post(
  "/:id/apply",
  helmet({ crossOriginResourcePolicy: false }),
  ensureDataIsValid(applicationEmailSchema),
  sendApplicationUserController,
);

jobRouter.post(
  "/user-info",
  ensureDataIsValid(contactEmailSchema),
  getGameEmailController,
);

jobRouter.post(
  "/contact",
  ensureDataIsValid(contactEmailSchema),
  sendContactEmailController,
);

export default jobRouter;
