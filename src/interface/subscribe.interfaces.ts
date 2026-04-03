import { z } from "zod";
import { subscribeSchema } from "../schemas/subscribe.schemas";

export type SubscribeData = z.infer<typeof subscribeSchema>;
