// src/controllers/broadcast.controllers.ts

import { Request, Response, NextFunction } from "express";
import { sendBroadcastService } from "../services/broadcast.services";

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