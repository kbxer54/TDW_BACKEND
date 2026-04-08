import { Request, Response, NextFunction } from "express";
import {
  createJobService,
  getAllJobsService,
  getJobByIdService,
  hardDeleteJobService,
  updateJobService,
  toggleJobStatusService,
} from "../services/jobs.services";

export const createJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const job = await createJobService(req.body);
  res.status(201).json(job);
};

export const getAllJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const jobs = await getAllJobsService();
  res.status(200).json(jobs);
}; 

export const getJobByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const job = await getJobByIdService(Number(req.params.id));
  res.status(200).json(job);
};

export const updateJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const job = await updateJobService(Number(req.params.id), req.body);
  res.status(200).json(job);
};

export const deactivateJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const job = await toggleJobStatusService(Number(req.params.id));
  res.status(200).json({ message: "Job deactivated successfully", job });
};

export const hardDeleteJobController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await hardDeleteJobService(Number(req.params.id));
  res.status(200).json({ message: "Job deleted successfully" });
};
