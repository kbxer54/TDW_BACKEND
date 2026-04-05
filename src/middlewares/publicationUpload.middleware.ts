import { Request } from "express";
import multer from "multer";
import { AppError } from "../error";

const MAX_PUBLICATION_IMAGES = 6;
const MAX_PUBLICATION_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const publicationUpload = multer({
  // Mantemos os arquivos em memoria ate a validacao e a persistencia terminarem para evitar arquivos orfaos em disco.
  // We keep files in memory until validation and persistence finish to avoid orphan files on disk.
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PUBLICATION_IMAGE_SIZE,
    files: MAX_PUBLICATION_IMAGES,
  },
  fileFilter: (request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError("Unsupported image format", 400, [
          {
            field: "images",
            message: "Only JPG, PNG, WEBP and GIF images are allowed",
          },
        ]),
      );
      return;
    }

    callback(null, true);
  },
});

export const publicationUploadMiddleware = publicationUpload.fields([
  { name: "images", maxCount: MAX_PUBLICATION_IMAGES },
  { name: "image", maxCount: 1 },
]);

export const getPublicationUploadFiles = (
  request: Request,
): Express.Multer.File[] => {
  const files = request.files as
    | Record<string, Express.Multer.File[]>
    | undefined;

  if (!files) {
    return [];
  }

  return [...(files.images || []), ...(files.image || [])].slice(
    0,
    MAX_PUBLICATION_IMAGES,
  );
};
