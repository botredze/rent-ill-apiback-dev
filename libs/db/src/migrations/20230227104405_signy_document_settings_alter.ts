import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.boolean('is_required_for_everyone').defaultTo(false).after('reminders_schedule');
                t.boolean('is_sign_order_exists').defaultTo(false).after('is_required_for_everyone');
            });
        }
    });

    await knex.schema.hasTable(dbNames.signyDocumentInputSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentInputSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_required_for_everyone');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_required_for_everyone');
                t.dropColumn('is_sign_order_exists');
            });
        }
    });
}
