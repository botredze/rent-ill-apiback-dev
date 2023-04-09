import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.roles.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema
                .alterTable(dbNames.roles.tableName, (t: Knex.TableBuilder) => {
                    t.dropForeign(['user_id'], 'roles_user_id_foreign');
                })
                .catch((e) => console.log(e));
            await knex.schema.alterTable(dbNames.roles.tableName, (t: Knex.TableBuilder) => {
                t.dropUnique(['user_id'], 'roles_user_id_unique');
                t.dropColumn('user_id');
            });
            await knex.schema.alterTable(dbNames.roles.tableName, (t: Knex.TableBuilder) => {
                t.integer('user_id')
                    .unsigned()
                    .nullable()
                    .references('id')
                    .inTable(dbNames.users.tableName)
                    .after('id');
            });
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export async function down(knex: Knex): Promise<void> {}
