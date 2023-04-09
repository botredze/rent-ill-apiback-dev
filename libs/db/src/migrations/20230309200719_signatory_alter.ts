import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSignatories.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSignatories.tableName, (t: Knex.TableBuilder) => {
                t.boolean('is_visible').defaultTo(true).after('date_of_sign');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSignatories.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSignatories.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_visible');
            });
        }
    });
}
