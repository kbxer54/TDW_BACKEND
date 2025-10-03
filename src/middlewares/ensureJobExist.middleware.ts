import { Request, Response, NextFunction } from "express";
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Job } from "../entities/jobs.entity";
import { AppError } from "../error";

export const ensureJobExists = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { id } = request.params; 

  const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

  // Verificar se o job existe
  const job = await jobRepository.findOne({
    where: { id: Number(id) },
  });

  if (!job) {
    throw new AppError("Job not found", 404); 
  }

  return next(); 
};
