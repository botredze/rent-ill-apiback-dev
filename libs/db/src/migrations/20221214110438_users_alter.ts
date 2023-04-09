import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.users.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.boolean('is_user_hints_passed').defaultTo(false).after('temp_email');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.users.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_user_hints_passed');
            });
        }
    });
}
