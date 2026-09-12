import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateObjectsTable1789205732292 implements MigrationInterface {
    name = 'CreateObjectsTable1789205732292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "objects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "grbs" character varying NOT NULL, "oksName" character varying NOT NULL, "constructionStage" character varying, "address" text, "coordinates" geography(Point,4326), "industry" character varying, "status" character varying, "ownership" character varying, "amo" character varying, "customer" character varying, "npGpName" character varying, "fpName" character varying, "projectCode" character varying, "totalArea" double precision, "capacity" double precision, "expertise" character varying, "startYear" integer, "endYear" integer, "constructionPeriod" character varying, "landTransferDate" character varying, "constructionPermitDate" character varying, "contractConclusionDate" character varying, "contractPeriod" character varying, "contractor" character varying, "constructionReadiness" double precision, "equipmentInstallationDate" character varying, "hydraulicTestActDate" character varying, "zosDate" character varying, "zosNumber" character varying, "commissioningActDate" character varying, "commissioningActNumber" character varying, "commissioningYear" integer, "photo" character varying, CONSTRAINT "PK_87b86663af0123508099f0d970a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "objects"`);
    }

}
