import { Router } from "express";
import {
  createPublicationController,
  deletePublicationController,
  getAllPublicationsController,
  getPublicationByIdController,
  getPublicationBySlugController,
  removePublicationImageController,
  updatePublicationController,
} from "../controllers/publications.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ensureDataIsValid } from "../middlewares/ensureDataIsValid.middleware";
import { publicationUploadMiddleware } from "../middlewares/publicationUpload.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import {
  publicationCreateSchema,
  publicationUpdateSchema,
} from "../schemas/publication.schemas";

const publicationRouter = Router();

publicationRouter.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  publicationUploadMiddleware,
  ensureDataIsValid(publicationCreateSchema),
  createPublicationController,
);

publicationRouter.get("/", getAllPublicationsController);
publicationRouter.get("/slug/:slug", getPublicationBySlugController);
publicationRouter.get("/:id", getPublicationByIdController);

publicationRouter.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  publicationUploadMiddleware,
  ensureDataIsValid(publicationUpdateSchema),
  updatePublicationController,
);

publicationRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  deletePublicationController,
);

publicationRouter.delete(
  "/:publicationId/images/:imageId",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  removePublicationImageController,
);

export default publicationRouter;
