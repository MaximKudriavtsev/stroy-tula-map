import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsRepliedToReport1789601000000 implements MigrationInterface {
    name = 'AddIsRepliedToReport1789601000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" ADD "isReplied" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "isReplied"`);
    }

}
