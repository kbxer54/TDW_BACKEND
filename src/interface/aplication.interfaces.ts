import { z } from "zod";
import { applicationEmailSchema, contactEmailSchema } from "../schemas/aplication.schemas";

export type ApplicationEmailData = z.infer<typeof applicationEmailSchema>;
export type ContactEmailData = z.infer<typeof contactEmailSchema>;
