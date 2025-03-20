import { z } from "zod";
import { userSchema } from "./user.schemas";

export const jobSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "O título da vaga deve ter pelo menos 3 caracteres"),
  description: z.string(),
  isActive: z.boolean().default(true), 
  createdAt: z.date().default(new Date()),
  users: z.array(userSchema).optional(),
});

export const jobSchemaRequest = jobSchema.omit({ id: true })

export const allJobsSchemasResponse = z.array(jobSchema)