// service/jobs.services.ts

import { AppDataSource } from "../data-source";
import { Job } from "../entities/jobs.entity";
import { Repository } from "typeorm";
import {
  TAllJobsSchemasResponse,
  TJobSchemaRequest,
  TJobType,
} from "../interface/jobs.interfaces";
import { allJobsSchemasResponse, jobSchema } from "../schemas/job.schemas";


const jobRepository = AppDataSource.getRepository(Job);

export const createJobService = async (data: Partial<Job>): Promise<Job> => {
  const job = jobRepository.create(data);
  await jobRepository.save(job);
  return job;
};

export const getAllJobsService =
  async (): Promise<TAllJobsSchemasResponse> => {
    const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

    // Busca todos os jobs
    const jobs = await jobRepository.find();

    // Aplica o schema Zod para formatar o retorno de todos os jobs
    const returnJobs = allJobsSchemasResponse.parse(jobs);

    return returnJobs;
  };  

export const getJobByIdService = async (jobId: number): Promise<TJobType> => {
  const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

  const job = await jobRepository.findOneBy({ id: jobId });

  const returnJob = jobSchema.parse(job);

  return returnJob;
};  

export const updateJobService = async (
  jobId: number,
  payload: Partial<TJobSchemaRequest>
): Promise<TJobType> => {
  const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

  // Busca o job pelo ID
  const job = await jobRepository.findOneBy({ id: jobId });


  // Atualiza os campos do job
  const updatedJob = jobRepository.merge(job!, payload);

  // Salva o job atualizado no banco de dados
  await jobRepository.save(updatedJob);

  // Aplica o schema Zod para formatar o retorno
  const returnJob = jobSchema.parse(updatedJob);

  return returnJob;
}; 

export const toggleJobStatusService = async (
  jobId: number
): Promise<TJobType> => {
  const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

  // Busca o job pelo ID
  const job = await jobRepository.findOneBy({ id: jobId });

  if (!job) {
    throw new Error("Job not found");
  }


  job.isActive = !job.isActive;

  await jobRepository.save(job);

  // Aplica o schema Zod para formatar o retorno
  const returnJob = jobSchema.parse(job);

  return returnJob;
};
 
