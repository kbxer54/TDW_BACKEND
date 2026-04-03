import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscribersTable1775201428566 implements MigrationInterface {
    name = 'CreateSubscribersTable1775201428566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "message" text NOT NULL, "portfolioLink" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "jobId" integer NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscribers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "unsubscribe_token" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1a7163c08f0e57bd1c9821508b1" UNIQUE ("email"), CONSTRAINT "PK_cbe0a7a9256c826f403c0236b67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "isActive" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_deceed16bcc624dbf873508e5bc" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_deceed16bcc624dbf873508e5bc"`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "isActive" DROP NOT NULL`);
        await queryRunner.query(`DROP TABLE "subscribers"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
