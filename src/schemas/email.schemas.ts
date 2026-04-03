import { z } from "zod";

export const applyJobSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  portfolioUrl: z.string().url("Invalid URL format").optional().or(z.literal('')),
  coverLetter: z.string().min(10, "Cover letter too short").max(3000, "Cover letter too long")
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  message: z.string().min(10, "Message too short").max(5000, "Message too long")
});