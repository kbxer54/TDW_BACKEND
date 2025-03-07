import { Request, Response } from "express";
import {
  getGameEmail,
  sendApplicationEmail,
  sendContactEmail,
} from "../services/sendEmail.services";
import {
  applicationEmailSchema,
  contactEmailSchema,
} from "../schemas/aplication.schemas";
import { z } from "zod";

export const sendApplicationUserController = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    // Valida os dados recebidos
    const validatedData = applicationEmailSchema.parse(request.body);

    // Chama o serviço e espera o retorno
    const result = await sendApplicationEmail(validatedData);

    if (result.success) {
      response.status(200).json({ message: result.message });
    } else {
      response
        .status(500)
        .json({ message: "Error sending email!", error: result.error });
    }
  } catch (error) {
    // Extrai as mensagens de erro do zod
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      response.status(400).json({
        message: "Validation error",
        errors,
      });
    } else {
      response.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};

export const sendContactEmailController = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    // Valida os dados recebidos
    const validatedData = contactEmailSchema.parse(request.body);

    // Chama o serviço e espera o retorno
    const result = await sendContactEmail(validatedData);

    if (result.success) {
      response.status(200).json({ message: result.message });
    } else {
      response
        .status(500)
        .json({ message: "Error sending contact email!", error: result.error });
    }
  } catch (error) {
    // Extrai as mensagens de erro do zod
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      response.status(400).json({
        message: "Validation error",
        errors,
      });
    } else {
      response.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
export const getGameEmailController = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    // Valida os dados recebidos
    const validatedData = contactEmailSchema.parse(request.body);

    // Chama o serviço e espera o retorno
    const result = await getGameEmail(validatedData);

    if (result.success) {
      response.status(200).json({ message: result.message });
    } else {
      response
        .status(500)
        .json({ message: "Error sending game email!", error: result.error });
    }
  } catch (error) {
    // Extrai as mensagens de erro do zod
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      response.status(400).json({
        message: "Validation error",
        errors,
      });
    } else {
      response.status(400).json({
        message: "Validation error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};