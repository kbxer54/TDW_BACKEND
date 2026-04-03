import rateLimit from "express-rate-limit";
import cors from "cors";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 15, 
  message: "Too many requests! Please try again later.",
});

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ["*"];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  credentials: true,
  optionsSuccessStatus: 204,
};

export { limiter, corsOptions };