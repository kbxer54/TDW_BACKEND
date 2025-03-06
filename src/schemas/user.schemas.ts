import { z } from "zod";

export const userSchema = z.object({
  id: z.number().optional(), // O ID será gerado automaticamente pelo banco
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
  portfolioLink: z.string().url("URL inválida").optional(),
  createdAt: z.date().default(new Date()), // Adicionando data de criação
});