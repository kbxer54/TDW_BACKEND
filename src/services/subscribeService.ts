import { AppDataSource } from "../data-source"; 
import { Subscriber } from "../entities/subscriber.entity";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID; 

export class SubscribeService {
  /*
  Executes the business logic for subscribing a user.
  Throws errors if the user is already active, which will be caught by the controller.
  
  Executa a lógica de negócios para inscrever um usuário.
  Lança erros se o usuário já estiver ativo, que serão capturados pelo controller.
  */
  async execute(name: string, email: string) {
    const subscriberRepo = AppDataSource.getRepository(Subscriber);

    const existingSubscriber = await subscriberRepo.findOneBy({ email });
    
    if (existingSubscriber) {
      if (!existingSubscriber.is_active) {
        existingSubscriber.is_active = true;
        await subscriberRepo.save(existingSubscriber);
        return { message: "Welcome back to the hunt!" };
      }
      throw new Error("Email already registered");
    }

    const newSubscriber = subscriberRepo.create({ name, email });
    await subscriberRepo.save(newSubscriber);

    if (AUDIENCE_ID) {
      try {
        await resend.contacts.create({
          audienceId: AUDIENCE_ID,
          email: email,
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" ") || "", 
          unsubscribed: false,
        });
      } catch (error) {
        console.error("Resend API Error:", error);
      }
    }

    return { message: "Subscription successful!" };
  }
}

