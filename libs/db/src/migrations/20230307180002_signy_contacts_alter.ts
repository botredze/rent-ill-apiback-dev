import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyContact.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema
                .alterTable(dbNames.signyContact.tableName, (t: Knex.TableBuilder) => {
                    t.dropUnique(['email']);
                })
                .catch((e) => console.log(e));
            await knex.schema
                .alterTable(dbNames.signyContact.tableName, (t: Knex.TableBuilder) => {
                    t.dropUnique(['phone']);
                })
                .catch((e) => console.log(e));
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyContact.tableName).then(async (exists: boolean) => {
        console.log(exists);
    });
}
