import { Request, Response } from "express";
import {
  RequestWithAuth,
} from "../interface/auth.interfaces";
import {
  deactivateAccountService,
  hardDeleteAccountService,
  getAccountProfileService,
  loginService,
  registerAccountService,
  updateAccountByAdminService,
  updateOwnProfileService,
} from "../services/auth.services";

export const registerController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const authRequest = request as RequestWithAuth;
  const account = await registerAccountService(request.body, authRequest.authAccount);
  response.status(201).json(account);
};

export const loginController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const authPayload = await loginService(request.body);
  response.status(200).json(authPayload);
};

export const getProfileController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const authRequest = request as RequestWithAuth;
  const profile = await getAccountProfileService(authRequest.authAccount!.id);
  response.status(200).json(profile);
};

export const updateOwnProfileController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const authRequest = request as RequestWithAuth;
  const account = await updateOwnProfileService(authRequest.authAccount!.id, request.body);
  response.status(200).json(account);
};

export const updateAccountByAdminController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const account = await updateAccountByAdminService(Number(request.params.id), request.body);
  response.status(200).json(account);
};

export const deleteAccountByAdminController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const authRequest = request as RequestWithAuth;
  await deactivateAccountService(Number(request.params.id), authRequest.authAccount!);
  response.status(200).json({ message: "Account deactivated successfully" });
};

export const deactivateAccountController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const authRequest = request as RequestWithAuth;
  await deactivateAccountService(Number(request.params.id), authRequest.authAccount!);
  response.status(200).json({ message: "Account deactivated successfully" });
};

export const hardDeleteAccountController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const authRequest = request as RequestWithAuth;
  await hardDeleteAccountService(Number(request.params.id), authRequest.authAccount!);
  response.status(200).json({ message: "Account deleted successfully" });
};
