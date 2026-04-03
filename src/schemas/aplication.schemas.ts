import { z } from "zod";

const smartUrl = z
  .string()
  .trim()
  .transform((val) => {
    if (!val) return "";
    if (!val.startsWith("http")) {
      return `https://${val}`;
    }
    return val;
  })
  .pipe(
    z.union([
      z
        .string()
        .url("Invalid URL format")
        // NOVA REGRA AQUI TAMBÉM
        .refine((val) => val.includes("."), {
          message: "URL must have a domain (e.g. .com)",
        }),
      z.literal(""),
    ]),
  );

export const applicationEmailSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Invalid email address"),
    message: z.string().trim().optional(),
    coverLetter: z.string().trim().optional(),
    portfolioLink: smartUrl.optional(),
    portfolioUrl: smartUrl.optional(),
    jobName: z.string().trim().min(1, "Job name is required").optional(),
  })
  .superRefine((data, context) => {
    const normalizedMessage = data.message || data.coverLetter || "";

    if (!normalizedMessage) {
      context.addIssue({
        code: "custom",
        path: ["message"],
        message: "Message is required",
      });
      return;
    }

    if (normalizedMessage.length < 10) {
      context.addIssue({
        code: "custom",
        path: ["message"],
        message: "Message must be at least 10 characters",
      });
    }
  })
  .transform((data) => ({
    name: data.name,
    email: data.email,
    message: (data.message || data.coverLetter || "").trim(),
    portfolioLink: data.portfolioLink || data.portfolioUrl || undefined,
    jobName: data.jobName?.trim() || undefined,
  }));

export const contactEmailSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  subject: z.string().trim().min(1, "Subject is required"),
  message: z.string().trim().min(1, "Message is required"),
});

export const getGameSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
});
