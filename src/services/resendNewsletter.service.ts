import { Resend, type ErrorResponse as ResendErrorResponse } from "resend";
import { AppError } from "../error";
import { TPublication } from "../interface/publications.interfaces";
import { SubscribeData } from "../interface/subscribe.interfaces";

type NewsletterResult = { message: string };

const publicationBaseUrl = "https://playthedarkwest.com/news";

const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new AppError("Newsletter service is not configured", 500);
  }

  return new Resend(apiKey);
};

const getAudienceId = (): string => {
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!audienceId) {
    throw new AppError("Newsletter service is not configured", 500);
  }

  return audienceId;
};

const getSenderEmail = (): string => {
  const senderEmail = process.env.SENDER_EMAIL;

  if (!senderEmail) {
    throw new AppError("Newsletter service is not configured", 500);
  }

  return senderEmail;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const normalizeName = (name: string): string => name.trim().replace(/\s+/g, " ");

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isResendError = (error: unknown): error is ResendErrorResponse =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  "name" in error &&
  "statusCode" in error;

const isNotFoundError = (error: unknown): boolean =>
  isResendError(error) && (error.name === "not_found" || error.statusCode === 404);

const logNewsletterError = (
  operation: string,
  context: Record<string, string | number | null | undefined>,
  error: unknown,
): void => {
  if (isResendError(error)) {
    console.error("Newsletter provider error:", {
      operation,
      ...context,
      providerCode: error.name,
      statusCode: error.statusCode,
      message: error.message,
    });
    return;
  }

  console.error("Newsletter error:", {
    operation,
    ...context,
    message: error instanceof Error ? error.message : "Unknown error",
  });
};

const getContactByEmail = async (email: string) => {
  const resend = getResendClient();
  const audienceId = getAudienceId();
  const response = await resend.contacts.get({
    audienceId,
    email,
  });

  if (response.error) {
    if (isNotFoundError(response.error)) {
      return null;
    }

    throw response.error;
  }

  return response.data;
};

const buildPublicationBroadcastContent = (
  publication: TPublication,
): {
  subject: string;
  html: string;
  text: string;
  previewText: string;
  publicUrl: string;
} => {
  const publicUrl = `${publicationBaseUrl}/${publication.slug}`;
  const escapedTitle = escapeHtml(publication.title);
  const escapedSummary = escapeHtml(publication.summary);
  const escapedPublicUrl = escapeHtml(publicUrl);
  const subject = `New on The Dark West: ${publication.title}`;
  const previewText = publication.summary.slice(0, 120);
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6;">
      <p style="margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em;">
        The Dark West
      </p>
      <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">${escapedTitle}</h1>
      <p style="margin: 0 0 24px; font-size: 16px;">${escapedSummary}</p>
      <p style="margin: 0 0 24px;">
        <a
          href="${escapedPublicUrl}"
          style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px;"
        >
          Read the full post
        </a>
      </p>
      <p style="margin: 0 0 16px; font-size: 14px;">
        Or open this link directly:<br />
        <a href="${escapedPublicUrl}" style="color: #111827;">${escapedPublicUrl}</a>
      </p>
      <p style="margin: 32px 0 0; font-size: 12px; color: #6b7280;">
        If you no longer want to receive these updates, you can unsubscribe here:
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #6b7280;">unsubscribe</a>
      </p>
    </div>
  `.trim();
  const text = [
    subject,
    "",
    publication.summary,
    "",
    "Read the full post:",
    publicUrl,
    "",
    "Unsubscribe:",
    "{{{RESEND_UNSUBSCRIBE_URL}}}",
  ].join("\n");

  return {
    subject,
    html,
    text,
    previewText,
    publicUrl,
  };
};

export const subscribeContact = async (
  data: SubscribeData,
): Promise<NewsletterResult> => {
  const resend = getResendClient();
  const audienceId = getAudienceId();
  const email = normalizeEmail(data.email);
  const fullName = normalizeName(data.name);

  try {
    const existingContact = await getContactByEmail(email);

    if (!existingContact) {
      const { error } = await resend.contacts.create({
        audienceId,
        email,
        firstName: fullName,
        unsubscribed: false,
      });

      if (error) {
        throw error;
      }

      return { message: "Subscription successful!" };
    }

    if (!existingContact.unsubscribed) {
      return { message: "This email is already subscribed." };
    }

    const { error } = await resend.contacts.update({
      audienceId,
      email,
      firstName: fullName,
      unsubscribed: false,
    });

    if (error) {
      throw error;
    }

    return { message: "Subscription successful!" };
  } catch (error) {
    logNewsletterError("subscribeContact", { email }, error);
    throw new AppError(
      "We couldn't complete your subscription right now.",
      500,
    );
  }
};

export const unsubscribeContact = async (
  emailInput: string,
): Promise<NewsletterResult> => {
  const resend = getResendClient();
  const audienceId = getAudienceId();
  const email = normalizeEmail(emailInput);

  try {
    const existingContact = await getContactByEmail(email);

    if (!existingContact) {
      return {
        message:
          "If this email is subscribed, it has been unsubscribed successfully.",
      };
    }

    const { error } = await resend.contacts.update({
      audienceId,
      email,
      unsubscribed: true,
    });

    if (error) {
      throw error;
    }

    return {
      message:
        "If this email is subscribed, it has been unsubscribed successfully.",
    };
  } catch (error) {
    logNewsletterError("unsubscribeContact", { email }, error);
    throw new AppError("We couldn't complete your request right now.", 500);
  }
};

export const broadcastPublicationCreated = async (
  publication: TPublication,
): Promise<void> => {
  const resend = getResendClient();
  const audienceId = getAudienceId();
  const senderEmail = getSenderEmail();
  const { subject, html, text, previewText } =
    buildPublicationBroadcastContent(publication);

  const { error } = await resend.broadcasts.create({
    audienceId,
    from: senderEmail,
    subject,
    html,
    text,
    previewText,
    name: publication.slug,
    send: true,
  });

  if (error) {
    throw error;
  }
};
