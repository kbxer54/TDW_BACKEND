import { Request, Response, NextFunction } from "express";
import { AppError } from "../error";
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Job } from "../entities/jobs.entity";

export const ensureNameJobExists = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { title } = request.body; // Pegando o título da vaga vindo do corpo da requisição

  const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

  // Procurar um job com o mesmo título
  const jobExists = await jobRepository.findOne({
    where: { title },
  });

  if (jobExists) {
    throw new AppError("Job with this title already exists", 409); // Se já existir, lançar erro
  }

  return next(); // Se o job não existir, continuar para o próximo middleware ou controller
};
