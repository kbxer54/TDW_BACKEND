import { z } from "zod";
import {
  emailQueueStatuses,
  emailQueueTypes,
} from "../interface/emailQueue.interfaces";

export const emailQueueTypeSchema = z.enum(emailQueueTypes);
export const emailQueueStatusSchema = z.enum(emailQueueStatuses);

export const emailQueueListQuerySchema = z.object({
  status: emailQueueStatusSchema.optional(),
  type: emailQueueTypeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const emailQueueIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
