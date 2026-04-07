import { z } from "zod";

export const newsletterUnsubscribeSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});
