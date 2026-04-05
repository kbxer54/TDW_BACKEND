import { z } from "zod";
import {
  publicationCreateSchema,
  publicationListQuerySchema,
  publicationListResponseSchema,
  publicationSchema,
  publicationUpdateSchema,
} from "../schemas/publication.schemas";
import { PublicationType } from "./publicationMeta.interfaces";

export type TPublication = z.infer<typeof publicationSchema>;
export type TPublicationCreateRequest = z.infer<typeof publicationCreateSchema>;
export type TPublicationUpdateRequest = z.infer<typeof publicationUpdateSchema>;
export type TPublicationListQuery = z.infer<typeof publicationListQuerySchema>;
export type TPublicationListResponse = z.infer<typeof publicationListResponseSchema>;
export type { PublicationType };
