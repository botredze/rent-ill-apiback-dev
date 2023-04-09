import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSignatories.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSignatories.tableName, (t: Knex.TableBuilder) => {
                t.enum('read_status', ['NOT_RECEIVED', 'SENT', 'NOT_SENT', 'OPENED', 'READ'])
                    .notNullable()
                    .defaultTo('NOT_SENT')
                    .after('is_password_on');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSignatories.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSignatories.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('read_status');
            });
        }
    });
}
