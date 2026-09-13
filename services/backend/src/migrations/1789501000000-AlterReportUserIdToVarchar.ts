import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterReportUserIdToVarchar1789501000000 implements MigrationInterface {
    name = 'AlterReportUserIdToVarchar1789501000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" ALTER COLUMN "userId" TYPE character varying USING "userId"::text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid`);
    }

}
