import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.otpCodes.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.otpCodes.tableName, (t: Knex.TableBuilder) => {
                t.enum('otp_type', [
                    'CURRENT_EMAIL',
                    'RESET_PASSWORD',
                    'CHANGE_EMAIL',
                    'CHANGE_PHONE',
                    'NEW_EMAIL',
                    'LAST_PHONE',
                ])
                    .notNullable()
                    .alter();
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.otpCodes.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.otpCodes.tableName, (t: Knex.TableBuilder) => {
                t.enum('otp_type', ['CURRENT_EMAIL', 'RESET_PASSWORD', 'CHANGE_EMAIL', 'NEW_EMAIL'])
                    .notNullable()
                    .alter();
            });
        }
    });
}
