export const emailQueueTypes = [
  "APPLICATION",
  "CONTACT",
  "USER_INFO",
  "PUBLICATION_BROADCAST",
] as const;

export const emailQueueStatuses = [
  "PENDING",
  "PROCESSING",
  "SENT",
  "FAILED",
  "RETRYING",
  "CANCELLED",
] as const;

export type EmailQueueType = (typeof emailQueueTypes)[number];
export type EmailQueueStatus = (typeof emailQueueStatuses)[number];

export type EmailQueuePayload = Record<string, unknown>;

export type EmailQueueCreateData = {
  type: EmailQueueType;
  from?: string;
  to?: string;
  replyTo?: string;
  subject?: string;
  text?: string;
  html?: string;
  payload?: EmailQueuePayload;
  scheduledAt?: Date;
  maxAttempts?: number;
};

export type EmailQueueListQuery = {
  status?: EmailQueueStatus;
  type?: EmailQueueType;
  page: number;
  limit: number;
};
