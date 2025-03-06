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
  const { id } = request.params; // Pegando o ID do job vindo dos parâmetros da requisição

  const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

  // Verificar se o job existe
  const job = await jobRepository.findOne({
    where: { id: Number(id) },
  });



  //Esta negando oque vir como resultado e esta afirmando que o job ja existe
  if (!job!.isActive) {
    throw new AppError("Job is not active", 400); // Se o job não estiver ativo, lançar erro
  }

  return next(); // Se o job estiver ativo, continuar para o próximo middleware ou controller
};
