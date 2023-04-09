import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentCustomGroups.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema
                .alterTable(dbNames.signyDocumentCustomGroups.tableName, (t: Knex.TableBuilder) => {
                    t.dropForeign(['document_id'], 'signy_document_custom_groups_document_id_foreign');
                })
                .catch((e) => console.log(e));
            await knex.schema.alterTable(dbNames.signyDocumentCustomGroups.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('document_id');
            });
            await knex.schema.alterTable(dbNames.signyDocumentCustomGroups.tableName, (t: Knex.TableBuilder) => {
                t.jsonb('document_ids').nullable().after('creator_id');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentCustomGroups.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentCustomGroups.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('document_ids');
            });
        }
    });
}
