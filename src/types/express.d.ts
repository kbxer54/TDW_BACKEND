import { AuthenticatedAccount } from "../interface/auth.interfaces";

declare global {
  namespace Express {
    interface Request {
      authAccount?: AuthenticatedAccount;
    }
  }
}

export {};
