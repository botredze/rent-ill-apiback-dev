import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentInputSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentInputSettings.tableName, (t: Knex.TableBuilder) => {
                t.jsonb('extra_data').nullable().after('input_order');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentInputSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentInputSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('extra_data');
            });
        }
    });
}
