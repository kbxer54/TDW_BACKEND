import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTypeToPublications1775394600000
  implements MigrationInterface
{
  name = "AddTypeToPublications1775394600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "publications"
      ADD COLUMN "type" character varying(32) NOT NULL DEFAULT 'PATCH_NOTE'
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_publications_type_createdAt"
      ON "publications" ("type", "createdAt" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_publications_type_createdAt"`,
    );
    await queryRunner.query(`
      ALTER TABLE "publications"
      DROP COLUMN "type"
    `);
  }
}
