import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.users.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.index(['email'], 'email_fulltext_idx', 'FULLTEXT');
            });
        }
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export async function down(knex: Knex): Promise<void> {}
