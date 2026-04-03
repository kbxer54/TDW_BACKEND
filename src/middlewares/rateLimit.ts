import rateLimit from "express-rate-limit";

export const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { error: "Too many subscription attempts. Please try again later." },
});