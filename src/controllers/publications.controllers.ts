import { Request, Response } from "express";
import { RequestWithAuth } from "../interface/auth.interfaces";
import { getPublicationUploadFiles } from "../middlewares/publicationUpload.middleware";
import { AppError } from "../error";
import {
  createPublicationService,
  deletePublicationService,
  getAllPublicationsService,
  getPublicationByIdService,
  getPublicationBySlugService,
  removePublicationImageService,
  updatePublicationService,
} from "../services/publications.services";
import { broadcastPublicationCreated } from "../services/resendNewsletter.service";

const isProviderError = (
  error: unknown,
): error is { message: string; name: string; statusCode: number | null } =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  "name" in error &&
  "statusCode" in error;

export const createPublicationController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const authRequest = request as RequestWithAuth;
  const publication = await createPublicationService(
    request.body,
    getPublicationUploadFiles(request),
    authRequest.authAccount!,
  );

  try {
    await broadcastPublicationCreated(publication);
  } catch (error) {
    // A falha no broadcast nao pode desfazer a publication ja persistida.
    // A broadcast failure must not roll back an already persisted publication.
    console.error("Publication newsletter broadcast error:", {
      operation: "broadcastPublicationCreated",
      publicationId: publication.id,
      slug: publication.slug,
      providerCode: isProviderError(error) ? error.name : undefined,
      statusCode: error instanceof AppError ? error.statusCode : undefined,
      providerStatusCode: isProviderError(error) ? error.statusCode : undefined,
      message: isProviderError(error)
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }

  response.status(201).json(publication);
};

export const getAllPublicationsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const publications = await getAllPublicationsService(request.query);
  response.status(200).json(publications);
};

export const getPublicationByIdController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const publication = await getPublicationByIdService(Number(request.params.id));
  response.status(200).json(publication);
};

export const getPublicationBySlugController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const publication = await getPublicationBySlugService(String(request.params.slug));
  response.status(200).json(publication);
};

export const updatePublicationController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const publication = await updatePublicationService(
    Number(request.params.id),
    request.body,
    getPublicationUploadFiles(request),
  );

  response.status(200).json(publication);
};

export const deletePublicationController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await deletePublicationService(Number(request.params.id));
  response.status(200).json({ message: "Publication deleted successfully" });
};

export const removePublicationImageController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await removePublicationImageService(
    Number(request.params.publicationId),
    Number(request.params.imageId),
  );

  response
    .status(200)
    .json({ message: "Publication image removed successfully" });
};
