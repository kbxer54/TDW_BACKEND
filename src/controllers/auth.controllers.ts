import { Request, Response, NextFunction } from "express";
import { registerService, loginService } from "../services/auth.services";

/*
English explanation here
The controller layer responsible for handling HTTP requests for the authentication routes. It delegates execution to the services and catches any AppError to send it to the global errorHandler.
Explicação em português aqui
A camada de controle responsável por lidar com requisições HTTP para as rotas de autenticação. Delega a execução aos serviços e captura qualquer AppError para enviá-lo ao errorHandler global.
*/

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await registerService(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await loginService(req.body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};