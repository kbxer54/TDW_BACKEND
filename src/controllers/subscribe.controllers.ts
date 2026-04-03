import { Request, Response } from "express";
import { subscribeToNewsletter } from "../services/subscribe.services";

export const subscribeController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await subscribeToNewsletter(request.body);
  response.status(201).json(result);
};
