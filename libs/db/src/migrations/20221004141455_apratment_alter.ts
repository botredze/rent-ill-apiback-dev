import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.addresses.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.addresses.tableName, (t: Knex.TableBuilder) => {
                t.integer('apartment').nullable().after('area_name');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.addresses.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.addresses.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('apartment');
            });
        }
    });
}
