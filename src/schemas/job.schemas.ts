import { z } from "zod";
import { userSchema } from "./user.schemas";

export const jobSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  users: z.array(userSchema).optional(),
});

export const jobSchemaRequest = jobSchema.omit({
  id: true,
  createdAt: true,
  users: true,
});

export const allJobsSchemasResponse = z.array(jobSchema);
