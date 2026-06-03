import { Resend, type ErrorResponse as ResendErrorResponse } from "resend";
import { AppDataSource } from "../data-source";
import { EmailQueue } from "../entities/emailQueue.entity";
import { AppError } from "../error";
import {
  EmailQueueCreateData,
  EmailQueueListQuery,
  EmailQueuePayload,
  EmailQueueStatus,
  EmailQueueType,
} from "../interface/emailQueue.interfaces";
import { TPublication } from "../interface/publications.interfaces";
import { emailQueueListQuerySchema } from "../schemas/emailQueue.schemas";
import { broadcastPublicationCreated } from "./resendNewsletter.service";

type EmailQueueJobResponse = {
  id: number;
  type: EmailQueueType;
  status: EmailQueueStatus;
  to: string | null;
  subject: string | null;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  sentAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProviderResult = {
  providerMessageId?: string;
};

let emailQueueTimer: NodeJS.Timeout | null = null;

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WORKER_INTERVAL_MS = 30000;
const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_PROCESSING_TIMEOUT_MINUTES = 15;
const MAX_ERROR_LENGTH = 500;
const RETRY_DELAYS_MINUTES = [5, 15, 60, 360, 1440];

const emailQueueRepository = () => AppDataSource.getRepository(EmailQueue);

const getPositiveIntegerEnv = (key: string, fallback: number): number => {
  const parsedValue = Number(process.env[key]);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new AppError("Email service is not configured", 500);
  }

  return new Resend(apiKey);
};

const normalizeOptionalString = (
  value: string | undefined,
  maxLength: number,
): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.slice(0, maxLength);
};

const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message.slice(0, MAX_ERROR_LENGTH);
  }

  if (isResendError(error)) {
    return `${error.name}: ${error.message}`.slice(0, MAX_ERROR_LENGTH);
  }

  if (error instanceof Error) {
    return error.message.slice(0, MAX_ERROR_LENGTH);
  }

  return "Unknown email queue error";
};

const isResendError = (error: unknown): error is ResendErrorResponse =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  "name" in error &&
  "statusCode" in error;

const isRateLimitError = (error: unknown): boolean =>
  isResendError(error) &&
  (error.statusCode === 429 ||
    error.name === "rate_limit_exceeded" ||
    error.name === "daily_quota_exceeded");

const getRetryDelayMinutes = (attempts: number, error: unknown): number => {
  if (isRateLimitError(error)) {
    return getPositiveIntegerEnv("EMAIL_QUEUE_RATE_LIMIT_DELAY_MINUTES", 1440);
  }

  return RETRY_DELAYS_MINUTES[
    Math.min(Math.max(attempts - 1, 0), RETRY_DELAYS_MINUTES.length - 1)
  ];
};

const mapJobToResponse = (job: EmailQueue): EmailQueueJobResponse => ({
  id: job.id,
  type: job.type,
  status: job.status,
  to: job.to ? maskEmail(job.to) : null,
  subject: job.subject,
  attempts: job.attempts,
  maxAttempts: job.maxAttempts,
  scheduledAt: job.scheduledAt,
  sentAt: job.sentAt,
  lastError: job.lastError,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return "***";
  }

  const visiblePrefix = localPart.slice(0, Math.min(localPart.length, 2));

  return `${visiblePrefix}***@${domain}`;
};

const assertEmailJobCanBeDelivered = (job: EmailQueue): void => {
  if (!job.from || !job.to || !job.subject || (!job.text && !job.html)) {
    throw new AppError("Queued email is missing required delivery fields", 500);
  }
};

const deliverDirectEmailJob = async (job: EmailQueue): Promise<ProviderResult> => {
  assertEmailJobCanBeDelivered(job);

  const resend = getResendClient();
  const emailPayload = {
    from: job.from!,
    to: job.to!,
    subject: job.subject!,
    ...(job.replyTo ? { replyTo: job.replyTo } : {}),
    ...(job.html ? { html: job.html } : { text: job.text! }),
  };

  const { data, error } = await resend.emails.send(emailPayload);

  if (error) {
    throw error;
  }

  return { providerMessageId: data?.id };
};

const getPublicationPayload = (payload: EmailQueuePayload | null): TPublication => {
  if (
    !payload ||
    typeof payload.id !== "number" ||
    typeof payload.title !== "string" ||
    typeof payload.summary !== "string" ||
    typeof payload.slug !== "string"
  ) {
    throw new AppError("Queued publication broadcast is missing payload data", 500);
  }

  return payload as TPublication;
};

const deliverJob = async (job: EmailQueue): Promise<ProviderResult> => {
  if (job.type === "PUBLICATION_BROADCAST") {
    await broadcastPublicationCreated(getPublicationPayload(job.payload));
    return {};
  }

  return deliverDirectEmailJob(job);
};

const claimPendingJobs = async (limit: number): Promise<EmailQueue[]> =>
  AppDataSource.transaction(async (manager) => {
    const repository = manager.getRepository(EmailQueue);
    const now = new Date();
    const queryBuilder = repository
      .createQueryBuilder("job")
      .setLock("pessimistic_write")
      .setOnLocked("skip_locked")
      .where("job.status IN (:...statuses)", {
        statuses: ["PENDING", "RETRYING"],
      })
      .andWhere("job.scheduledAt <= :now", { now })
      .orderBy("job.scheduledAt", "ASC")
      .addOrderBy("job.id", "ASC")
      .take(limit);

    const jobs = await queryBuilder.getMany();

    for (const job of jobs) {
      job.status = "PROCESSING";
      job.attempts += 1;
      job.lastError = null;
    }

    await repository.save(jobs);

    return jobs;
  });

const recoverStaleProcessingJobs = async (): Promise<void> => {
  const timeoutMinutes = getPositiveIntegerEnv(
    "EMAIL_QUEUE_PROCESSING_TIMEOUT_MINUTES",
    DEFAULT_PROCESSING_TIMEOUT_MINUTES,
  );
  const staleBefore = new Date(Date.now() - timeoutMinutes * 60 * 1000);

  const result = await emailQueueRepository()
    .createQueryBuilder()
    .update(EmailQueue)
    .set({
      status: "RETRYING",
      scheduledAt: new Date(),
      lastError: "Recovered after worker interruption",
    })
    .where("status = :status", { status: "PROCESSING" })
    .andWhere("updatedAt <= :staleBefore", { staleBefore })
    .execute();

  if (result.affected && result.affected > 0) {
    console.warn("Email queue recovered stale processing jobs:", {
      recovered: result.affected,
    });
  }
};

const markJobAsSent = async (
  job: EmailQueue,
  result: ProviderResult,
): Promise<void> => {
  await emailQueueRepository().update(job.id, {
    status: "SENT",
    sentAt: new Date(),
    providerMessageId: result.providerMessageId || null,
    lastError: null,
  });
};

const markJobAsFailedOrRetrying = async (
  job: EmailQueue,
  error: unknown,
): Promise<void> => {
  const shouldRetry = job.attempts < job.maxAttempts;
  const nextScheduledAt = new Date(
    Date.now() + getRetryDelayMinutes(job.attempts, error) * 60 * 1000,
  );

  await emailQueueRepository().update(job.id, {
    status: shouldRetry ? "RETRYING" : "FAILED",
    scheduledAt: shouldRetry ? nextScheduledAt : job.scheduledAt,
    lastError: sanitizeErrorMessage(error),
  });

  console.warn("Email queue job failed:", {
    emailJobId: job.id,
    type: job.type,
    status: shouldRetry ? "RETRYING" : "FAILED",
    attempts: job.attempts,
    nextScheduledAt: shouldRetry ? nextScheduledAt.toISOString() : null,
    message: sanitizeErrorMessage(error),
  });
};

export const enqueueEmailJob = async (
  data: EmailQueueCreateData,
): Promise<EmailQueueJobResponse> => {
  const repository = emailQueueRepository();
  const job = repository.create({
    type: data.type,
    status: "PENDING",
    from: normalizeOptionalString(data.from, 320),
    to: normalizeOptionalString(data.to, 320),
    replyTo: normalizeOptionalString(data.replyTo, 320),
    subject: normalizeOptionalString(data.subject, 255),
    text: data.text || null,
    html: data.html || null,
    payload: data.payload || null,
    scheduledAt: data.scheduledAt || new Date(),
    maxAttempts: data.maxAttempts || DEFAULT_MAX_ATTEMPTS,
  });

  const savedJob = await repository.save(job);

  console.info("Email queue job created:", {
    emailJobId: savedJob.id,
    type: savedJob.type,
    status: savedJob.status,
  });

  return mapJobToResponse(savedJob);
};

export const enqueuePublicationBroadcastJob = async (
  publication: TPublication,
): Promise<EmailQueueJobResponse> =>
  enqueueEmailJob({
    type: "PUBLICATION_BROADCAST",
    payload: {
      id: publication.id,
      title: publication.title,
      summary: publication.summary,
      slug: publication.slug,
    },
  });

export const processEmailQueueBatch = async (): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> => {
  const batchSize = getPositiveIntegerEnv("EMAIL_QUEUE_BATCH_SIZE", DEFAULT_BATCH_SIZE);
  await recoverStaleProcessingJobs();
  const jobs = await claimPendingJobs(batchSize);
  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      const result = await deliverJob(job);
      await markJobAsSent(job, result);
      sent += 1;
    } catch (error) {
      await markJobAsFailedOrRetrying(job, error);
      failed += 1;
    }
  }

  return {
    processed: jobs.length,
    sent,
    failed,
  };
};

export const startEmailQueueWorker = (): void => {
  if (
    process.env.NODE_ENV === "test" ||
    process.env.EMAIL_QUEUE_WORKER_ENABLED === "false" ||
    emailQueueTimer
  ) {
    return;
  }

  const intervalMs = getPositiveIntegerEnv(
    "EMAIL_QUEUE_INTERVAL_MS",
    DEFAULT_WORKER_INTERVAL_MS,
  );

  emailQueueTimer = setInterval(() => {
    processEmailQueueBatch().catch((error) => {
      console.error("Email queue worker error:", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }, intervalMs);

  emailQueueTimer.unref();
  setTimeout(() => {
    processEmailQueueBatch().catch((error) => {
      console.error("Email queue startup process error:", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }, 1000).unref();
  console.info("Email queue worker started:", { intervalMs });
};

export const getEmailQueueStatusService = async () => {
  const rawCounts = await emailQueueRepository()
    .createQueryBuilder("job")
    .select("job.status", "status")
    .addSelect("COUNT(job.id)", "count")
    .groupBy("job.status")
    .getRawMany<{ status: EmailQueueStatus; count: string }>();

  const counts = rawCounts.reduce(
    (accumulator, row) => {
      accumulator[row.status] = Number(row.count);
      return accumulator;
    },
    {
      PENDING: 0,
      PROCESSING: 0,
      SENT: 0,
      FAILED: 0,
      RETRYING: 0,
      CANCELLED: 0,
    } as Record<EmailQueueStatus, number>,
  );

  const nextJob = await emailQueueRepository().findOne({
    where: [
      { status: "PENDING" },
      { status: "RETRYING" },
    ],
    order: {
      scheduledAt: "ASC",
      id: "ASC",
    },
  });

  return {
    counts,
    nextScheduledAt: nextJob?.scheduledAt || null,
  };
};

export const listEmailQueueJobsService = async (rawQuery: unknown) => {
  const query: EmailQueueListQuery = emailQueueListQuerySchema.parse(rawQuery);
  const skip = (query.page - 1) * query.limit;
  const where: Partial<Pick<EmailQueue, "status" | "type">> = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.type) {
    where.type = query.type;
  }

  const [jobs, total] = await emailQueueRepository().findAndCount({
    where,
    order: {
      createdAt: "DESC",
      id: "DESC",
    },
    skip,
    take: query.limit,
  });

  return {
    data: jobs.map(mapJobToResponse),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
  };
};

export const retryEmailQueueJobService = async (
  emailJobId: number,
): Promise<EmailQueueJobResponse> => {
  const repository = emailQueueRepository();
  const job = await repository.findOneBy({ id: emailJobId });

  if (!job) {
    throw new AppError("Email queue job not found", 404);
  }

  if (job.status === "SENT" || job.status === "PROCESSING") {
    throw new AppError("Email queue job cannot be retried in its current status", 400);
  }

  job.status = "PENDING";
  job.scheduledAt = new Date();
  job.lastError = null;

  return mapJobToResponse(await repository.save(job));
};

export const cancelEmailQueueJobService = async (
  emailJobId: number,
): Promise<EmailQueueJobResponse> => {
  const repository = emailQueueRepository();
  const job = await repository.findOneBy({ id: emailJobId });

  if (!job) {
    throw new AppError("Email queue job not found", 404);
  }

  if (job.status === "SENT" || job.status === "PROCESSING") {
    throw new AppError("Email queue job cannot be cancelled in its current status", 400);
  }

  job.status = "CANCELLED";

  return mapJobToResponse(await repository.save(job));
};
