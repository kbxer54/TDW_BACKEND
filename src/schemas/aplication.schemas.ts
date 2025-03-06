import { z } from "zod";

export const applicationEmailSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().optional(),
  portfolioLink: z.string().url("Invalid URL").optional(),
  jobName: z.string().min(1, "Job name is required"),
});

export const contactEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});
