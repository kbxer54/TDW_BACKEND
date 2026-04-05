import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sanitizeHtml from "sanitize-html";
import { EntityManager } from "typeorm";
import { AppDataSource } from "../data-source";
import { Publication } from "../entities/publications.entity";
import { PublicationImage } from "../entities/publicationImages.entity";
import { AppError } from "../error";
import { AuthenticatedAccount } from "../interface/auth.interfaces";
import {
  PublicationType,
  TPublication,
  TPublicationCreateRequest,
  TPublicationListQuery,
  TPublicationListResponse,
  TPublicationUpdateRequest,
} from "../interface/publications.interfaces";
import {
  publicationListQuerySchema,
  publicationListResponseSchema,
  publicationSchema,
} from "../schemas/publication.schemas";

const publicationUploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "publications",
);
const publicationUploadBaseUrl = "/uploads/publications";

const sanitizePlainText = (value: string): string =>
  sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();

const sanitizePublicationContent = (value: string): string =>
  sanitizeHtml(value, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        {
          rel: "noopener noreferrer",
          target: "_blank",
        },
        true,
      ),
    },
  }).trim();

const normalizeTitleToSlug = (title: string): string => {
  const baseSlug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return baseSlug || `publication-${Date.now()}`;
};

const sanitizePublicationFileName = (fileName: string): string =>
  path
    .basename(fileName)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 255);

const getFileExtension = (file: Express.Multer.File): string => {
  const originalExtension = path.extname(file.originalname).toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  const mimeTypeToExtension: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return mimeTypeToExtension[file.mimetype] || ".bin";
};

const buildUniquePublicationSlug = async (
  title: string,
  manager: EntityManager,
  currentPublicationId?: number,
): Promise<string> => {
  const baseSlug = normalizeTitleToSlug(title);
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const existingPublication = await manager.getRepository(Publication).findOne({
      where: { slug: candidate },
    });

    if (!existingPublication || existingPublication.id === currentPublicationId) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const mapPublicationToResponse = (publication: Publication): TPublication =>
  publicationSchema.parse({
    id: publication.id,
    title: publication.title,
    summary: publication.summary,
    content: publication.content,
    slug: publication.slug,
    type: publication.type,
    author: publication.author
      ? {
          id: publication.author.id,
          name: publication.author.name,
          role: publication.author.role,
        }
      : null,
    images: [...(publication.images || [])]
      .sort((firstImage, secondImage) => firstImage.sortOrder - secondImage.sortOrder)
      .map((image) => ({
        id: image.id,
        fileUrl: image.fileUrl,
        fileName: image.fileName,
        mimeType: image.mimeType,
        size: image.size,
        order: image.sortOrder,
        createdAt: image.createdAt,
      })),
    createdAt: publication.createdAt,
    updatedAt: publication.updatedAt,
  });

const removeStoredFiles = async (storedFiles: string[]): Promise<void> => {
  if (storedFiles.length === 0) {
    return;
  }

  const deletionResults = await Promise.allSettled(
    storedFiles.map(async (storedFile) => {
      await fs.unlink(storedFile);
    }),
  );

  deletionResults.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn(
        `Failed to remove publication file: ${storedFiles[index]}`,
        result.reason,
      );
    }
  });
};

const removeStoredFilesByUrl = async (fileUrls: string[]): Promise<void> => {
  const storedFiles = fileUrls.map((fileUrl) =>
    path.join(publicationUploadDirectory, path.basename(fileUrl)),
  );

  await removeStoredFiles(storedFiles);
};

const getPublicationOrFail = async (
  publicationId: number,
  manager: EntityManager = AppDataSource.manager,
): Promise<Publication> => {
  const publication = await manager.getRepository(Publication).findOne({
    where: { id: publicationId },
    relations: {
      author: true,
      images: true,
    },
  });

  if (!publication) {
    throw new AppError("Publication not found", 404);
  }

  return publication;
};

const getPublicationBySlugOrFail = async (
  slug: string,
  manager: EntityManager = AppDataSource.manager,
): Promise<Publication> => {
  const publication = await manager.getRepository(Publication).findOne({
    where: { slug },
    relations: {
      author: true,
      images: true,
    },
  });

  if (!publication) {
    throw new AppError("Publication not found", 404);
  }

  return publication;
};

const savePublicationImages = async ({
  publicationId,
  files,
  initialOrder,
  manager,
  trackedStoredFiles,
}: {
  publicationId: number;
  files: Express.Multer.File[];
  initialOrder: number;
  manager: EntityManager;
  trackedStoredFiles: string[];
}): Promise<void> => {
  if (files.length === 0) {
    return;
  }

  await fs.mkdir(publicationUploadDirectory, { recursive: true });
  const imageRepository = manager.getRepository(PublicationImage);

  for (const [index, file] of files.entries()) {
    const storedFileName = `${Date.now()}-${crypto.randomUUID()}${getFileExtension(
      file,
    )}`;
    const absoluteFilePath = path.join(publicationUploadDirectory, storedFileName);

    await fs.writeFile(absoluteFilePath, file.buffer);
    trackedStoredFiles.push(absoluteFilePath);

    const publicationImage = imageRepository.create({
      publicationId,
      // Persistimos apenas a URL publica relativa, nunca o caminho absoluto interno.
      // We persist only the relative public URL, never the internal absolute path.
      fileUrl: `${publicationUploadBaseUrl}/${storedFileName}`,
      fileName: sanitizePublicationFileName(file.originalname),
      mimeType: file.mimetype,
      size: file.size,
      sortOrder: initialOrder + index,
    });

    await imageRepository.save(publicationImage);
  }
};

const normalizeCreatePublicationData = (
  data: TPublicationCreateRequest,
): TPublicationCreateRequest => {
  const normalizedData = {
    title: sanitizePlainText(data.title),
    summary: sanitizePlainText(data.summary),
    content: sanitizePublicationContent(data.content),
    type: data.type,
  };

  if (!normalizedData.title) {
    throw new AppError("Title is required", 400, [
      { field: "title", message: "Title is required" },
    ]);
  }

  if (!normalizedData.summary) {
    throw new AppError("Summary is required", 400, [
      { field: "summary", message: "Summary is required" },
    ]);
  }

  if (!normalizedData.content) {
    throw new AppError("Content is required", 400, [
      { field: "content", message: "Content is required" },
    ]);
  }

  return normalizedData;
};

const normalizeUpdatePublicationData = (
  data: TPublicationUpdateRequest,
): TPublicationUpdateRequest => {
  const normalizedData: TPublicationUpdateRequest = {};

  if (typeof data.title === "string") {
    const title = sanitizePlainText(data.title);

    if (!title) {
      throw new AppError("Title is required", 400, [
        { field: "title", message: "Title is required" },
      ]);
    }

    normalizedData.title = title;
  }

  if (typeof data.summary === "string") {
    const summary = sanitizePlainText(data.summary);

    if (!summary) {
      throw new AppError("Summary is required", 400, [
        { field: "summary", message: "Summary is required" },
      ]);
    }

    normalizedData.summary = summary;
  }

  if (typeof data.content === "string") {
    const content = sanitizePublicationContent(data.content);

    if (!content) {
      throw new AppError("Content is required", 400, [
        { field: "content", message: "Content is required" },
      ]);
    }

    normalizedData.content = content;
  }

  if (typeof data.type === "string") {
    normalizedData.type = data.type;
  }

  return normalizedData;
};

export const createPublicationService = async (
  data: TPublicationCreateRequest,
  files: Express.Multer.File[],
  actor: AuthenticatedAccount,
): Promise<TPublication> => {
  const normalizedData = normalizeCreatePublicationData(data);
  const trackedStoredFiles: string[] = [];

  try {
    return await AppDataSource.transaction(async (manager) => {
      const publicationRepository = manager.getRepository(Publication);
      const publication = publicationRepository.create({
        ...normalizedData,
        slug: await buildUniquePublicationSlug(normalizedData.title, manager),
        authorId: actor.id,
      });

      await publicationRepository.save(publication);
      await savePublicationImages({
        publicationId: publication.id,
        files,
        initialOrder: 0,
        manager,
        trackedStoredFiles,
      });

      const savedPublication = await getPublicationOrFail(publication.id, manager);

      return mapPublicationToResponse(savedPublication);
    });
  } catch (error) {
    await removeStoredFiles(trackedStoredFiles);
    throw error;
  }
};

export const getAllPublicationsService = async (
  rawQuery: unknown,
): Promise<TPublicationListResponse> => {
  const query: TPublicationListQuery = publicationListQuerySchema.parse(rawQuery);
  const skip = (query.page - 1) * query.limit;
  const whereClause: { type?: PublicationType } = {};

  if (query.type) {
    whereClause.type = query.type;
  }

  const [publications, total] = await AppDataSource.getRepository(Publication).findAndCount(
    {
      where: whereClause,
      relations: {
        author: true,
        images: true,
      },
      order: {
        createdAt: "DESC",
      },
      skip,
      take: query.limit,
    },
  );

  return publicationListResponseSchema.parse({
    data: publications.map(mapPublicationToResponse),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
  });
};

export const getPublicationByIdService = async (
  publicationId: number,
): Promise<TPublication> => {
  const publication = await getPublicationOrFail(publicationId);
  return mapPublicationToResponse(publication);
};

export const getPublicationBySlugService = async (
  slug: string,
): Promise<TPublication> => {
  const publication = await getPublicationBySlugOrFail(slug);
  return mapPublicationToResponse(publication);
};

export const updatePublicationService = async (
  publicationId: number,
  data: TPublicationUpdateRequest,
  files: Express.Multer.File[],
): Promise<TPublication> => {
  const normalizedData = normalizeUpdatePublicationData(data);
  const trackedStoredFiles: string[] = [];

  if (Object.keys(normalizedData).length === 0 && files.length === 0) {
    throw new AppError("At least one field or image must be provided", 400, [
      {
        field: "body",
        message: "At least one field or image must be provided",
      },
    ]);
  }

  try {
    return await AppDataSource.transaction(async (manager) => {
      const publicationRepository = manager.getRepository(Publication);
      const publication = await getPublicationOrFail(publicationId, manager);

      if (
        normalizedData.title &&
        normalizedData.title !== publication.title
      ) {
        publication.title = normalizedData.title;
        publication.slug = await buildUniquePublicationSlug(
          normalizedData.title,
          manager,
          publication.id,
        );
      }

      if (normalizedData.summary) {
        publication.summary = normalizedData.summary;
      }

      if (normalizedData.content) {
        publication.content = normalizedData.content;
      }

      if (normalizedData.type) {
        publication.type = normalizedData.type;
      }

      await publicationRepository.save(publication);

      const nextOrder =
        (publication.images || []).reduce(
          (highestOrder, image) => Math.max(highestOrder, image.sortOrder),
          -1,
        ) + 1;

      await savePublicationImages({
        publicationId: publication.id,
        files,
        initialOrder: nextOrder,
        manager,
        trackedStoredFiles,
      });

      const updatedPublication = await getPublicationOrFail(publication.id, manager);

      return mapPublicationToResponse(updatedPublication);
    });
  } catch (error) {
    await removeStoredFiles(trackedStoredFiles);
    throw error;
  }
};

export const deletePublicationService = async (
  publicationId: number,
): Promise<void> => {
  const fileUrls = await AppDataSource.transaction(async (manager) => {
    const publication = await getPublicationOrFail(publicationId, manager);
    const publicationRepository = manager.getRepository(Publication);

    await publicationRepository.remove(publication);

    return (publication.images || []).map((image) => image.fileUrl);
  });

  await removeStoredFilesByUrl(fileUrls);
};

export const removePublicationImageService = async (
  publicationId: number,
  imageId: number,
): Promise<void> => {
  const fileUrl = await AppDataSource.transaction(async (manager) => {
    const imageRepository = manager.getRepository(PublicationImage);
    const publicationImage = await imageRepository.findOne({
      where: {
        id: imageId,
        publicationId,
      },
    });

    if (!publicationImage) {
      throw new AppError("Publication image not found", 404);
    }

    await imageRepository.remove(publicationImage);

    return publicationImage.fileUrl;
  });

  await removeStoredFilesByUrl([fileUrl]);
};
