import { Resend } from "resend";
import { AppError } from "../error";
import { SubscribeData } from "../interface/subscribe.interfaces";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new AppError("Newsletter service is not configured", 500);
  }

  return new Resend(apiKey);
};

const getAudienceId = () => {
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!audienceId) {
    throw new AppError("Newsletter service is not configured", 500);
  }

  return audienceId;
};

export const subscribeToNewsletter = async (
  data: SubscribeData,
): Promise<{ message: string }> => {
  const resend = getResendClient();
  const audienceId = getAudienceId();
  const fullName = data.name.trim();

  const { error } = await resend.contacts.create({
    audienceId,
    email: data.email.trim().toLowerCase(),
    firstName: fullName.split(" ")[0],
    lastName: fullName.split(" ").slice(1).join(" ") || "",
    unsubscribed: false,
  });

  if (error) {
    const providerMessage =
      "message" in error && typeof error.message === "string"
        ? error.message.toLowerCase()
        : "";

    if (providerMessage.includes("already")) {
      return { message: "This email is already subscribed." };
    }

    throw new AppError(
      "We couldn't complete your subscription right now.",
      500,
    );
  }

  return { message: "Subscription successful!" };
};
