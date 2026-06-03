import {
  ApplicationEmailData,
  ContactEmailData,
  GetGameEmailData,
} from "../interface/aplication.interfaces";
import { enqueueEmailJob } from "./emailQueue.services";

const fromEmail =
  process.env.SENDER_EMAIL || "contact@playthedarkwest.com";
const toEmail = process.env.EMAIL_USER || fromEmail;

const queueEmailOrThrow = async ({
  type,
  subject,
  text,
  replyTo,
}: {
  type: "APPLICATION" | "CONTACT" | "USER_INFO";
  subject: string;
  text: string;
  replyTo?: string;
}) => {
  await enqueueEmailJob({
    type,
    from: fromEmail,
    to: toEmail,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
};

export const getGameEmail = async (
  data: GetGameEmailData
): Promise<{ message: string }> => {
  const { name, email } = data;
  await queueEmailOrThrow({
    type: "USER_INFO",
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

  await queueEmailOrThrow({
    type: "APPLICATION",
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

  await queueEmailOrThrow({
    type: "CONTACT",
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
