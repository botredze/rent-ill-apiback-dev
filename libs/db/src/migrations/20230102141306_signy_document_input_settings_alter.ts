import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentInputSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentInputSettings.tableName, (t: Knex.TableBuilder) => {
                t.integer('input_order').notNullable().defaultTo(0).after('is_range_one');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentInputSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentInputSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('input_order');
            });
        }
    });
}
