import rateLimit from "express-rate-limit";

/*
Middleware to limit the number of subscription requests per IP.
Prevents bot attacks and database flooding.

Middleware para limitar o número de requisições de inscrição por IP.
Previne ataques de bots e sobrecarga no banco de dados.
*/
export const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { error: "Too many subscription attempts. Please try again later." },
});