// src/services/broadcast.services.ts

import { AppDataSource } from "../data-source";
import { Subscriber } from "../entities/subscriber.entity";
import { AppError } from "../error";
import { TBroadcastRequest } from "../interface/broadcast.interfaces";
import { Resend } from "resend";

/*
English explanation here
Service responsible for fetching all active subscribers and sending a batch email using the Resend API. Appends a dynamic unsubscribe link to each email. Throws an AppError if no active subscribers are found.
Explicação em português aqui
Serviço responsável por buscar todos os inscritos ativos e enviar um e-mail em lote usando a API do Resend. Adiciona um link de cancelamento dinâmico a cada e-mail. Lança um AppError se nenhum inscrito ativo for encontrado.
*/

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBroadcastService = async (data: TBroadcastRequest): Promise<{ message: string }> => {
  const subscriberRepo = AppDataSource.getRepository(Subscriber);

  const activeSubscribers = await subscriberRepo.find({
    where: { is_active: true }
  });

  if (activeSubscribers.length === 0) {
    throw new AppError("No active subscribers found", 404);
  }

  const senderEmail = process.env.SENDER_EMAIL || "onboarding@resend.dev"; 
  const appUrl = process.env.APP_URL || "http://localhost:5173";

  const emailsToSend = activeSubscribers.map((subscriber) => {
    const unsubscribeUrl = `${appUrl}/unsubscribe?token=${subscriber.unsubscribe_token}`;
    
    const customHtml = `
      ${data.htmlContent}
      <br><br>
      <hr>
      <p style="font-size: 12px; color: #666;">
        You are receiving this email because you subscribed to The Dark West updates.<br>
        <a href="${unsubscribeUrl}">Click here to unsubscribe</a>
      </p>
    `;

    return {
      from: `The Dark West <${senderEmail}>`,
      to: subscriber.email,
      subject: data.subject,
      html: customHtml,
    };
  });

  const chunkSize = 100;
  for (let i = 0; i < emailsToSend.length; i += chunkSize) {
    const chunk = emailsToSend.slice(i, i + chunkSize);
    
    const { error } = await resend.batch.send(chunk);
    
    if (error) {
      console.error(`Error sending batch ${i / chunkSize + 1}:`, error);
    }
  }

  return { message: `Broadcast sent to ${activeSubscribers.length} hunters!` };
};