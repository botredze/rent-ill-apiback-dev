import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyEmail.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyEmail.tableName, (t: Knex.TableBuilder) => {
                t.integer('signy_email_template_id')
                    .unsigned()
                    .notNullable()
                    .references('id')
                    .inTable(dbNames.signyEmailTemplates.tableName)
                    .after('document_id');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyEmail.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyEmail.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('signy_email_template_id');
            });
        }
    });
}
