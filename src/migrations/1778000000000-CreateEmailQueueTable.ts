import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailQueueTable1778000000000 implements MigrationInterface {
  name = "CreateEmailQueueTable1778000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "email_queue" (
        "id" SERIAL NOT NULL,
        "type" character varying(32) NOT NULL,
        "status" character varying(32) NOT NULL DEFAULT 'PENDING',
        "to" character varying(320),
        "from" character varying(320),
        "replyTo" character varying(320),
        "subject" character varying(255),
        "text" text,
        "html" text,
        "payload" jsonb,
        "attempts" integer NOT NULL DEFAULT 0,
        "maxAttempts" integer NOT NULL DEFAULT 5,
        "providerMessageId" character varying(120),
        "lastError" text,
        "scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "sentAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_queue_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_email_queue_status_scheduledAt"
      ON "email_queue" ("status", "scheduledAt")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_email_queue_type_createdAt"
      ON "email_queue" ("type", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_email_queue_type_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_email_queue_status_scheduledAt"`);
    await queryRunner.query(`DROP TABLE "email_queue"`);
  }
}
