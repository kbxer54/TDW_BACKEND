// src/router/broadcast.routes.ts

import { Router } from "express";
import { sendBroadcastController } from "../controllers/broadcast.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { validateSchema } from "../middlewares/validate.middleware";
import { limiter } from "../middlewares/basedSecurity.middleware";
import { broadcastSchema } from "../schemas/broadcast.schemas";
import { Role } from "../enums/role";

const broadcastRouter = Router();

/*
English explanation here
Updated router that perfectly follows the project's architectural pattern. It applies the rate limiter, JWT authentication, role verification, Zod body validation, and finally the controller.
Explicação em português aqui
Roteador atualizado que segue perfeitamente o padrão arquitetural do projeto. Aplica o limitador de requisições, autenticação JWT, verificação de cargo, validação de corpo com Zod e, finalmente, o controlador.
*/
broadcastRouter.post(
  "/",
  limiter,
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.DEVELOPER]),
  validateSchema(broadcastSchema),
  sendBroadcastController
);

export default broadcastRouter;