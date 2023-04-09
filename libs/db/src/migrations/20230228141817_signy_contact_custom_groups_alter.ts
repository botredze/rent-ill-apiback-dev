import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyContactCustomGroup.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyContactCustomGroup.tableName, (t: Knex.TableBuilder) => {
                t.boolean('is_favourite').defaultTo(false).after('is_custom');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyContactCustomGroup.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyContactCustomGroup.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_favourite');
            });
        }
    });
}
