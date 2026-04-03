import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscribersTable1775201428566 implements MigrationInterface {
  name = "CreateSubscribersTable1775201428566";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subscribers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "unsubscribe_token" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_1a7163c08f0e57bd1c9821508b1" UNIQUE ("email"),
        CONSTRAINT "PK_cbe0a7a9256c826f403c0236b67" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs" ALTER COLUMN "isActive" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs" ALTER COLUMN "createdAt" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jobs" ALTER COLUMN "createdAt" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs" ALTER COLUMN "isActive" DROP NOT NULL
    `);

    await queryRunner.query(`
      DROP TABLE "subscribers"
    `);
  }
}