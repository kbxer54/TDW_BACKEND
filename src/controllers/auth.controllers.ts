import { Request, Response, NextFunction } from "express";
import { registerService, loginService } from "../services/auth.services";


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