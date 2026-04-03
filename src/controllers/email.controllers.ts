import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Job } from "../entities/jobs.entity";
import {
  getGameEmail,
  sendApplicationEmail,
  sendContactEmail,
} from "../services/sendEmail.services";

export const sendApplicationUserController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const jobRepository = AppDataSource.getRepository(Job);
  const job = await jobRepository.findOneBy({ id: Number(request.params.id) });

  const result = await sendApplicationEmail(
    request.body,
    job?.title || request.body.jobName,
  );

  response.status(200).json(result);
};

export const sendContactEmailController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await sendContactEmail(request.body);
  response.status(200).json(result);
};

export const getGameEmailController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await getGameEmail(request.body);
  response.status(200).json(result);
};
