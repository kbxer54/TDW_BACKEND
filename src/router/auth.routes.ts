import { Router } from "express";
import { registerController, loginController } from "../controllers/auth.controllers";
import { validateSchema } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schemas";
import { limiter } from "../middlewares/basedSecurity.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { Role } from "../enums/role";

const authRouter = Router();


authRouter.post(
  "/register",
  limiter,
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  validateSchema(registerSchema),
  registerController
);

authRouter.post(
  "/login",
  limiter,
  validateSchema(loginSchema),
  loginController
);

export default authRouter;