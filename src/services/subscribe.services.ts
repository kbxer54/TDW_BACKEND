import { SubscribeData } from "../interface/subscribe.interfaces";
import { subscribeContact } from "./resendNewsletter.service";

export const subscribeToNewsletter = async (
  data: SubscribeData,
): Promise<{ message: string }> => {
  return subscribeContact(data);
};
