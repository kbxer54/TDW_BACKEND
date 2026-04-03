// src/schemas/broadcast.schemas.ts

import { z } from "zod";

/*
English explanation here
Zod schema for validating the broadcast request payload. Ensures the subject and HTML content are present and meet minimum length requirements.
Explicação em português aqui
Schema Zod para validar a carga útil da requisição de envio em massa. Garante que o assunto e o conteúdo HTML estejam presentes e atendam aos requisitos mínimos de comprimento.
*/
export const broadcastSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters long"),
  htmlContent: z.string().min(10, "HTML content must be at least 10 characters long"),
});