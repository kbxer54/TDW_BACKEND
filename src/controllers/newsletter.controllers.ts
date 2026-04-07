import { Request, Response } from "express";
import { NewsletterUnsubscribeData } from "../interface/newsletter.interfaces";
import { unsubscribeContact } from "../services/resendNewsletter.service";

export const unsubscribeNewsletterController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { email } = request.body as NewsletterUnsubscribeData;
  const result = await unsubscribeContact(email);
  response.status(200).json(result);
};
