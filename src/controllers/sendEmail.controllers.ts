import { Request, Response } from "express";
import {
  getGameEmail,
  sendApplicationEmail,
  sendContactEmail,
} from "../services/sendEmail.services";

// Removemos as importações do Zod e Schemas daqui porque o Middleware vai resolver antes

export const sendApplicationUserController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  // O middleware ensureDataIsValid já garantiu que request.body está perfeito
  const result = await sendApplicationEmail(request.body);

  if (result.success) {
    response.status(200).json({ message: result.message });
  } else {
    response
      .status(500)
      .json({ message: "Error sending email!", error: result.error });
  }
};

export const sendContactEmailController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await sendContactEmail(request.body);

  if (result.success) {
    response.status(200).json({ message: result.message });
  } else {
    response
      .status(500)
      .json({ message: "Error sending contact email!", error: result.error });
  }
};

export const getGameEmailController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await getGameEmail(request.body);

  if (result.success) {
    response.status(200).json({ message: result.message });
  } else {
    response
      .status(500)
      .json({ message: "Error sending game email!", error: result.error });
  }
};
