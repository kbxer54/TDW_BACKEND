// src/interface/broadcast.interfaces.ts

import { z } from "zod";
import { broadcastSchema } from "../schemas/broadcast.schemas";

/*
English explanation here
Type definition inferred from the broadcast Zod schema to maintain type safety across the service and controller.
Explicação em português aqui
Definição de tipo inferida a partir do schema Zod de envio em massa para manter a segurança de tipos no serviço e no controlador.
*/
export type TBroadcastRequest = z.infer<typeof broadcastSchema>;