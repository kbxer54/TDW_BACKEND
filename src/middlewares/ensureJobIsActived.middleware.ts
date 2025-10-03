import { Request, Response, NextFunction } from "express";
import { AppError } from "../error";
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Job } from "../entities/jobs.entity";

export const ensureJobIsActive = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = request.params; 

  const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

  const job = await jobRepository.findOne({
    where: { id: Number(id) },
  });



  if (!job!.isActive) {
    throw new AppError("Job is not active", 400); 
  }

  return next(); 
};
