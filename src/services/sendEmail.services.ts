// src/services/sendEmail.services.ts

import { Resend } from "resend";
import {
  ApplicationEmailData,
  ContactEmailData,
} from "../interface/aplication.interfaces";


const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = "no-reply@playthedarkwest.comgit";
const toEmail = process.env.EMAIL_USER
  ? process.env.EMAIL_USER
  : "Hex@playthedarkwest.com";

export const sendApplicationEmail = async (
  data: ApplicationEmailData
): Promise<{ success: boolean; message?: string; error?: any }> => {
  const { name, email, message, portfolioLink, jobName } = data;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Application for job name: ${jobName}`,
      text: `
        Name: ${name}
        E-mail: ${email}
        Portfolio: ${portfolioLink || "Not provided"}
        Message: ${message}
        Application for job Name: ${jobName}
      `,
    });
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    return { success: false, error };
  }
};

export const sendContactEmail = async (
  data: ContactEmailData
): Promise<{ success: boolean; message?: string; error?: any }> => {
  const { name, email, message, portfolioLink } = data;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Contact Form Message",
      text: `
        Name: ${name}
        E-mail: ${email}
        Portfolio: ${portfolioLink || "Not provided"}
        Message: ${message}
      `,
    });
    return { success: true, message: "Contact email sent successfully!" };
  } catch (error) {
    return { success: false, error };
  }
};

export const getGameEmail = async (
  data: ContactEmailData
): Promise<{ success: boolean; message?: string; error?: any }> => {
  const { name, email } = data;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Game Form Message",
      text: `
        ${name.charAt(0).toUpperCase() + name.slice(1)} has joined the hunters!
        E-mail: ${email}
      `,
    });
    return { success: true, message: "Contact email sent successfully!" };
  } catch (error) {
    return { success: false, error };
  }
};
