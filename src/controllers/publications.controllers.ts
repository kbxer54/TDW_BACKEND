import { Request, Response } from "express";
import { RequestWithAuth } from "../interface/auth.interfaces";
import { getPublicationUploadFiles } from "../middlewares/publicationUpload.middleware";
import {
  createPublicationService,
  deletePublicationService,
  getAllPublicationsService,
  getPublicationByIdService,
  getPublicationBySlugService,
  removePublicationImageService,
  updatePublicationService,
} from "../services/publications.services";
import { enqueuePublicationBroadcastJob } from "../services/emailQueue.services";

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
    await enqueuePublicationBroadcastJob(publication);
  } catch (error) {
    // A falha ao enfileirar o broadcast nao pode desfazer a publication ja persistida.
    // Failing to enqueue the broadcast must not roll back an already persisted publication.
    console.error("Publication newsletter queue error:", {
      operation: "enqueuePublicationBroadcastJob",
      publicationId: publication.id,
      slug: publication.slug,
      message: error instanceof Error ? error.message : "Unknown error",
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
