import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportsTable1789401000000 implements MigrationInterface {
    name = 'CreateReportsTable1789401000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" text NOT NULL, "userId" character varying NOT NULL, "objectId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_reports_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_reports_objectId" ON "reports" ("objectId")`);
        await queryRunner.query(`CREATE INDEX "IDX_reports_userId" ON "reports" ("userId")`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_reports_objectId" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_objectId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_reports_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_reports_objectId"`);
        await queryRunner.query(`DROP TABLE "reports"`);
    }

}
