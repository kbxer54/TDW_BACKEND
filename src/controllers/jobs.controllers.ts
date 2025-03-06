import { Request, Response, NextFunction } from "express";
import {
  createJobService,
  getAllJobsService,
  getJobByIdService,
  updateJobService,
  toggleJobStatusService,
} from "../services/jobs.services";
import { AppDataSource } from "../data-source";

export const createJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await createJobService(req.body);
    res.status(201).json(job);
  } catch (error) {
    next(error); // Passa o erro para o errorHandler  
  }
}

export const getAllJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobs = await getAllJobsService();
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
}; 

export const getJobByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await getJobByIdService(Number(req.params.id));
    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

export const updateJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await updateJobService(Number(req.params.id), req.body);
    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

export const deactivateJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await toggleJobStatusService(Number(req.params.id));
    res.status(200).json({ message: "Job deactivated successfully", job });
  } catch (error) {
    next(error);
  }
};
