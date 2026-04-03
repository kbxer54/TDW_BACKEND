// src/controllers/broadcast.controllers.ts

import { Request, Response, NextFunction } from "express";
import { sendBroadcastService } from "../services/broadcast.services";

/*
English explanation here
Controller to handle the broadcast route. Calls the service and passes any errors to the global error handler. Formatted as an arrow function to match the project's standard architecture.
Explicação em português aqui
Controlador para lidar com a rota de envio em massa. Chama o serviço e repassa quaisquer erros para o tratador de erros global. Formatado como uma arrow function para corresponder à arquitetura padrão do projeto.
*/

export const sendBroadcastController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await sendBroadcastService(req.body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};