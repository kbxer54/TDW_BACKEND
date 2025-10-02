// src/config/nodemailer.config.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
  // ✅ ADICIONE ESTAS OPÇÕES DE TIMEOUT
  connectionTimeout: 10 * 1000, // 10 segundos
  socketTimeout: 10 * 1000, // 10 segundos
});

export default transporter;
