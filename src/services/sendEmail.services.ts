import { Resend } from "resend";
import {
  ApplicationEmailData,
  ContactEmailData,
} from "../interface/aplication.interfaces";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing env var: 'RESEND_API_KEY'");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = "contato@playthedarkwest.com";
const toEmail = process.env.EMAIL_USER || "Hex@playthedarkwest.com";

export const getGameEmail = async (
  data: ContactEmailData
): Promise<{ success: boolean; message?: string; error?: any; data?: any }> => {
  const { name, email } = data;
  console.log(`--- 1. ENTERED getGameEmail service for user: ${email} ---`);

  try {
    console.log(`--- 2. TRYING to send email via Resend... ---`);

    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Game Form Message",
      text: `
        ${name.charAt(0).toUpperCase() + name.slice(1)} has joined the hunters!
        E-mail: ${email}
      `,
    });

    if (error) {
      console.error("--- 4. RESEND API RETURNED AN ERROR ---", error);
      return { success: false, error: error };
    }

    console.log("--- 5. RESEND API CALL SUCCEEDED ---", responseData);
    return {
      success: true,
      message: "Email sent successfully!",
      data: responseData,
    };
  } catch (error) {
    console.error("--- CATCH BLOCK: An unexpected error occurred ---", error);
    return { success: false, error };
  }
};

export const sendApplicationEmail = async (
  data: ApplicationEmailData
): Promise<{ success: boolean; message?: string; error?: any; data?: any }> => {
  const { name, email, message, portfolioLink, jobName } = data;
  const { data: responseData, error } = await resend.emails.send({
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
  if (error) return { success: false, error };
  return {
    success: true,
    message: "Email sent successfully!",
    data: responseData,
  };
};

export const sendContactEmail = async (
  data: ContactEmailData
): Promise<{ success: boolean; message?: string; error?: any; data?: any }> => {
  const { name, email, message, portfolioLink } = data;
  const { data: responseData, error } = await resend.emails.send({
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
  if (error) return { success: false, error };
  return {
    success: true,
    message: "Contact email sent successfully!",
    data: responseData,
  };
};
