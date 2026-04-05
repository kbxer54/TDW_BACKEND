import { z } from "zod";
import { accountRoles } from "../interface/auth.interfaces";
import { publicationTypes } from "../interface/publicationMeta.interfaces";

const titleSchema = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters")
  .max(255, "Title is too long");

const summarySchema = z
  .string()
  .trim()
  .min(10, "Summary must be at least 10 characters")
  .max(500, "Summary is too long");

const contentSchema = z
  .string()
  .trim()
  .min(20, "Content must be at least 20 characters")
  .max(50000, "Content is too long");

const publicationAuthorSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    role: z.enum(accountRoles),
  })
  .nullable();

export const publicationTypeSchema = z.enum(publicationTypes);

export const publicationImageSchema = z.object({
  id: z.number(),
  fileUrl: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  order: z.number(),
  createdAt: z.date(),
});

export const publicationSchema = z.object({
  id: z.number(),
  title: titleSchema,
  summary: summarySchema,
  content: contentSchema,
  slug: z.string(),
  type: publicationTypeSchema,
  author: publicationAuthorSchema,
  images: z.array(publicationImageSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const publicationCreateSchema = z.object({
  title: titleSchema,
  summary: summarySchema,
  content: contentSchema,
  type: publicationTypeSchema.default("PATCH_NOTE"),
});

export const publicationUpdateSchema = z.object({
  title: titleSchema.optional(),
  summary: summarySchema.optional(),
  content: contentSchema.optional(),
  type: publicationTypeSchema.optional(),
});

export const publicationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
  type: publicationTypeSchema.optional(),
});

export const publicationListResponseSchema = z.object({
  data: z.array(publicationSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
