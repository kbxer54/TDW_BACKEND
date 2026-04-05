import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccountsTable1775300000000 implements MigrationInterface {
  name = "CreateAccountsTable1775300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" text NOT NULL,
        "role" character varying(32) NOT NULL DEFAULT 'DEVELOPER',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_accounts_email" UNIQUE ("email"),
        CONSTRAINT "PK_accounts_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "accounts"`);
  }
}
