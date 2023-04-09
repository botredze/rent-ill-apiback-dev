import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.users.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.boolean('is_trail_on').defaultTo(false).after('is_terms_policy_accepted');
            });
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.string('ext_user_phone').nullable().after('ext_user_avatar');
            });
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.string('national_id').nullable().after('ext_user_phone');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.users.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_trail_on');
            });
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('ext_user_phone');
            });
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('national_id');
            });
        }
    });
}
