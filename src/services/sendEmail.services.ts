import { Resend } from "resend";
import {
  ApplicationEmailData,
  ContactEmailData,
  GetGameEmailData,
} from "../interface/aplication.interfaces";
import { AppError } from "../error";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new AppError("Email service is not configured", 500);
  }

  return new Resend(apiKey);
};

const fromEmail =
  process.env.SENDER_EMAIL || "contact@playthedarkwest.com";
const toEmail = process.env.EMAIL_USER || fromEmail;

const sendEmailOrThrow = async ({
  subject,
  text,
  replyTo,
}: {
  subject: string;
  text: string;
  replyTo?: string;
}) => {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    console.error("Email provider error:", error.name || "ResendError");
    throw new AppError("We couldn't send the email right now.", 500);
  }
};

export const getGameEmail = async (
  data: GetGameEmailData
): Promise<{ message: string }> => {
  const { name, email } = data;
  await sendEmailOrThrow({
    subject: "Game Form Message",
    text: `
        ${name.charAt(0).toUpperCase() + name.slice(1)} has joined the hunters!
        E-mail: ${email}
      `,
    replyTo: email,
  });

  return { message: "Email sent successfully!" };
};

export const sendApplicationEmail = async (
  data: ApplicationEmailData,
  jobTitle?: string,
): Promise<{ message: string }> => {
  const { name, email, message, portfolioLink, jobName } = data;
  const resolvedJobTitle = jobTitle || jobName || "The Dark West";

  await sendEmailOrThrow({
    subject: `Application for job: ${resolvedJobTitle}`,
    text: `
        Name: ${name}
        E-mail: ${email}
        Portfolio: ${portfolioLink || "Not provided"}
        Message: ${message}
        Application for job: ${resolvedJobTitle}
      `,
    replyTo: email,
  });

  return { message: "Email sent successfully!" };
};

export const sendContactEmail = async (
  data: ContactEmailData
): Promise<{ message: string }> => {
  const { name, email, message, subject } = data;

  await sendEmailOrThrow({
    subject: `Contact Form: ${subject}`,
    text: `
        Name: ${name}
        E-mail: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
    replyTo: email,
  });

  return { message: "Contact email sent successfully!" };
};
