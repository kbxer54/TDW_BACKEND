import { Router } from "express";
import helmet from "helmet";
import {
  deleteAccountByAdminController,
  getProfileController,
  loginController,
  registerController,
  updateAccountByAdminController,
  updateOwnProfileController,
} from "../controllers/auth.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";
import { limiter } from "../middlewares/basedSecurity.middleware";
import { ensureDataIsValid } from "../middlewares/ensureDataIsValid.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import {
  adminAccountUpdateSchema,
  loginSchema,
  registerSchema,
  selfProfileUpdateSchema,
} from "../schemas/auth.schemas";

const authRouter = Router();

authRouter.post(
  "/login",
  helmet({ crossOriginResourcePolicy: false }),
  limiter,
  ensureDataIsValid(loginSchema),
  loginController,
);

authRouter.post(
  "/register",
  helmet({ crossOriginResourcePolicy: false }),
  limiter,
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  ensureDataIsValid(registerSchema),
  registerController,
);

authRouter.get("/me", authMiddleware, getProfileController);

authRouter.patch(
  "/me",
  authMiddleware,
  ensureDataIsValid(selfProfileUpdateSchema),
  updateOwnProfileController,
);

authRouter.patch(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  ensureDataIsValid(adminAccountUpdateSchema),
  updateAccountByAdminController,
);

authRouter.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteAccountByAdminController,
);

export default authRouter;
