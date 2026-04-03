import { z } from "zod";

// Mesmo truque do Front-end
const smartUrl = z
  .string()
  .transform((val) => {
    if (!val) return "";
    if (!val.startsWith("http")) {
      return `https://${val}`;
    }
    return val;
  })
  .pipe(z.union([z.string().url("Invalid URL format"), z.literal("")]));

export const userSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),

  // Aplica a transformação aqui
  portfolioLink: smartUrl.optional(),

  createdAt: z.date().default(() => new Date()),
});
