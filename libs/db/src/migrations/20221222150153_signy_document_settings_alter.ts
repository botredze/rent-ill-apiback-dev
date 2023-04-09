import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.boolean('send_progress_to_members')
                    .notNullable()
                    .defaultTo(false)
                    .after('is_allow_return_to_previous_screen');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('send_progress_to_members');
            });
        }
    });
}
