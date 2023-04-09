import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyEmailTemplates.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyEmailTemplates.tableName, (t: Knex.TableBuilder) => {
                t.json('company_logo').nullable().after('file_urls');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyEmailTemplates.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyEmailTemplates.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('company_logo');
            });
        }
    });
}
