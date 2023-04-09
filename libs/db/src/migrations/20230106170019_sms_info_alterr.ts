import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.smsInfo.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.smsInfo.tableName, (t: Knex.TableBuilder) => {
                t.integer('user_id')
                    .unsigned()
                    .nullable()
                    .references('id')
                    .inTable('users')
                    .onDelete('CASCADE')
                    .after('message');
                t.enum('type', ['PHONE_VERIFICATION', 'RESET_PASSWORD', 'CHANGE_PHONE', 'SIGNY_SMS'])
                    .notNullable()
                    .alter();
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.smsInfo.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.smsInfo.tableName, (t: Knex.TableBuilder) => {
                t.enum('type', ['PHONE_VERIFICATION', 'RESET_PASSWORD', 'CHANGE_PHONE']).notNullable().alter();
            });
        }
    });
}
