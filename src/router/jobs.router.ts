import { Router } from "express";
import {
  createJobController,
  hardDeleteJobController,
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
import { publicCache } from "../middlewares/cache.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ensureJobIsActive } from "../middlewares/ensureJobIsActived.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { jobSchemaRequest } from "../schemas/job.schemas";

const jobRouter = Router();
const publicReadCache = publicCache({
  maxAgeSeconds: 60,
  staleWhileRevalidateSeconds: 300,
});

jobRouter.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  ensureDataIsValid(jobSchemaRequest),
  ensureJobTitleAvailable,
  createJobController,
);
jobRouter.get("/", publicReadCache, getAllJobsController);
jobRouter.get("/:id", publicReadCache, ensureJobExists, getJobByIdController);
jobRouter.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  ensureDataIsValid(jobSchemaRequest.partial()),
  ensureJobExists,
  ensureJobTitleAvailable,
  updateJobController,
);
jobRouter.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  ensureJobExists,
  deactivateJobController,
);

jobRouter.delete(
  "/:id/permanent",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  ensureJobExists,
  hardDeleteJobController,
);

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
