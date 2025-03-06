import { z } from "zod";
import { allJobsSchemasResponse, jobSchema, jobSchemaRequest } from "../schemas/job.schemas";

export type TJobType = z.infer<typeof jobSchema>;
export type TJobSchemaRequest = z.infer<typeof jobSchemaRequest>
export type TAllJobsSchemasResponse  = z.infer<typeof allJobsSchemasResponse>