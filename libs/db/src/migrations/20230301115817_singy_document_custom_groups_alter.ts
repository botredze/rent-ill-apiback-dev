import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentCustomGroups.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema
                .alterTable(dbNames.signyDocumentCustomGroups.tableName, (t: Knex.TableBuilder) => {
                    t.boolean('is_favourite').defaultTo(false).after('document_ids');
                })
                .catch((e) => console.log(e));
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentCustomGroups.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentCustomGroups.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_favourite');
            });
        }
    });
}
