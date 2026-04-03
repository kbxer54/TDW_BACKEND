import { z } from "zod";

const smartUrl = z
  .string()
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

export const applicationEmailSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email:  z.string().email("Invalid email address"),
  message: z.string().optional(),
  portfolioLink: smartUrl.optional(), 
  jobName: z.string().min(1, "Job name is required"),
});

export const contactEmailSchema = applicationEmailSchema.omit({
  jobName: true,
});

export const getGameSchema = applicationEmailSchema.omit({
  jobName: true,
  portfolioLink: true,
});
