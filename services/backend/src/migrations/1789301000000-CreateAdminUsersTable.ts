import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminUsersTable1789301000000 implements MigrationInterface {
    name = 'CreateAdminUsersTable1789301000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_admin_users_email" UNIQUE ("email"), CONSTRAINT "PK_admin_users_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admin_users"`);
    }

}
