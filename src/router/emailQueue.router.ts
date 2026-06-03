import { Router } from "express";
import {
  cancelEmailQueueJobController,
  getEmailQueueStatusController,
  listEmailQueueJobsController,
  retryEmailQueueJobController,
} from "../controllers/emailQueue.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const emailQueueRouter = Router();

emailQueueRouter.use(authMiddleware, roleMiddleware(["ADMIN", "LEADER"]));

emailQueueRouter.get("/status", getEmailQueueStatusController);
emailQueueRouter.get("/jobs", listEmailQueueJobsController);
emailQueueRouter.post("/jobs/:id/retry", retryEmailQueueJobController);
emailQueueRouter.post("/jobs/:id/cancel", cancelEmailQueueJobController);

export default emailQueueRouter;
