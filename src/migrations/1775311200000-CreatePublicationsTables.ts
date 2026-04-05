import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePublicationsTables1775311200000
  implements MigrationInterface
{
  name = "CreatePublicationsTables1775311200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "publications" (
        "id" SERIAL NOT NULL,
        "title" character varying(255) NOT NULL,
        "summary" text NOT NULL,
        "content" text NOT NULL,
        "slug" character varying(255) NOT NULL,
        "authorId" integer,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_publications_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_publications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_publications_authorId_accounts_id"
          FOREIGN KEY ("authorId")
          REFERENCES "accounts"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "publication_images" (
        "id" SERIAL NOT NULL,
        "publicationId" integer NOT NULL,
        "fileUrl" character varying(255) NOT NULL,
        "fileName" character varying(255) NOT NULL,
        "mimeType" character varying(100) NOT NULL,
        "size" integer NOT NULL,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_publication_images_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_publication_images_publicationId_publications_id"
          FOREIGN KEY ("publicationId")
          REFERENCES "publications"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_publication_images_publicationId"
        ON "publication_images" ("publicationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_publication_images_publicationId"`,
    );
    await queryRunner.query(`DROP TABLE "publication_images"`);
    await queryRunner.query(`DROP TABLE "publications"`);
  }
}
