import { z } from "zod";
import { broadcastSchema } from "../schemas/broadcast.schemas";

export type TBroadcastRequest = z.infer<typeof broadcastSchema>;