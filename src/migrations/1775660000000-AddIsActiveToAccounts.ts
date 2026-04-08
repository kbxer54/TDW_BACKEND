import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToAccounts1775660000000 implements MigrationInterface {
  name = "AddIsActiveToAccounts1775660000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accounts"
      ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accounts"
      DROP COLUMN "isActive"
    `);
  }
}
