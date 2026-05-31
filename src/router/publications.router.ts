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
import { publicCache } from "../middlewares/cache.middleware";

const publicationRouter = Router();
const publicationListCache = publicCache({
  maxAgeSeconds: 60,
  staleWhileRevalidateSeconds: 300,
});
const publicationDetailCache = publicCache({
  maxAgeSeconds: 300,
  staleWhileRevalidateSeconds: 600,
});

publicationRouter.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "LEADER"]),
  publicationUploadMiddleware,
  ensureDataIsValid(publicationCreateSchema),
  createPublicationController,
);

publicationRouter.get("/", publicationListCache, getAllPublicationsController);
publicationRouter.get(
  "/slug/:slug",
  publicationDetailCache,
  getPublicationBySlugController,
);
publicationRouter.get("/:id", publicationDetailCache, getPublicationByIdController);

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
