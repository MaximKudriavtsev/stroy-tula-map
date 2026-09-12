import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryToObject1789222707827 implements MigrationInterface {
    name = 'AddCategoryToObject1789222707827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."objects_category_enum" AS ENUM('all', 'healthcare', 'education', 'sport', 'infrastructure', 'utilities_and_parks')`);
        await queryRunner.query(`ALTER TABLE "objects" ADD "category" "public"."objects_category_enum" NOT NULL DEFAULT 'all'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "objects" DROP COLUMN "category"`);
        await queryRunner.query(`DROP TYPE "public"."objects_category_enum"`);
    }

}
