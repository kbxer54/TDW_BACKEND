import { z } from "zod";
import { newsletterUnsubscribeSchema } from "../schemas/newsletter.schemas";

export type NewsletterUnsubscribeData = z.infer<
  typeof newsletterUnsubscribeSchema
>;
