import { Request, Response, NextFunction } from "express";
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Job } from "../entities/jobs.entity";
import { AppError } from "../error";

export const ensureJobTitleAvailable = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { title } = request.body;

  if (!title) {
    return next();
  }

  const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);
  const existingJob = await jobRepository.findOne({
    where: { title },
  });

  if (existingJob && existingJob.id !== Number(request.params.id)) {
    throw new AppError("Job with this title already exists", 409);
  }

  return next();
};
