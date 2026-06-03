import { Request, Response } from "express";
import { emailQueueIdParamSchema } from "../schemas/emailQueue.schemas";
import {
  cancelEmailQueueJobService,
  getEmailQueueStatusService,
  listEmailQueueJobsService,
  retryEmailQueueJobService,
} from "../services/emailQueue.services";

export const getEmailQueueStatusController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const status = await getEmailQueueStatusService();
  response.status(200).json(status);
};

export const listEmailQueueJobsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const jobs = await listEmailQueueJobsService(request.query);
  response.status(200).json(jobs);
};

export const retryEmailQueueJobController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { id } = emailQueueIdParamSchema.parse(request.params);
  const job = await retryEmailQueueJobService(id);
  response.status(200).json(job);
};

export const cancelEmailQueueJobController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { id } = emailQueueIdParamSchema.parse(request.params);
  const job = await cancelEmailQueueJobService(id);
  response.status(200).json(job);
};
