import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.boolean('is_branding_exists').defaultTo(false).after('is_verify_signature_on');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_branding_exists');
            });
        }
    });
}
