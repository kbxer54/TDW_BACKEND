import { Request, Response } from "express";
import { SubscribeService } from "../services/subscribeService";

export class SubscribeController {
  /*
  Handles the incoming HTTP request, validates input, and delegates to the service.
  Returns appropriate HTTP status codes based on the service execution result or errors.
  
  Lida com a requisição HTTP recebida, valida a entrada e delega para o service.
  Retorna os códigos de status HTTP apropriados com base no resultado da execução do service ou erros.
  */
  async handle(req: Request, res: Response) {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required." });
      }

      const subscribeService = new SubscribeService();
      const result = await subscribeService.execute(name, email);

      return res.status(201).json(result);
    } catch (error: any) {
      if (error.message === "Email already registered") {
        return res.status(409).json({ error: "This email is already registered." });
      }
      
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}