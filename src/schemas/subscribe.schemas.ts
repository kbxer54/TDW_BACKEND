import { z } from "zod";

export const subscribeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
});

export const unsubscribeSchema = z.object({
  token: z.string().uuid("Invalid token format"),
});