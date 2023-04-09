import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocument.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema
                .alterTable(dbNames.signyDocument.tableName, (t: Knex.TableBuilder) => {
                    t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED', 'ARCHIVED', 'DRAFT'])
                        .notNullable()
                        .defaultTo('ACTIVE')
                        .alter();
                })
                .catch((e) => console.log(e));
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocument.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocument.tableName, (t: Knex.TableBuilder) => {
                t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED', 'ARCHIVED'])
                    .notNullable()
                    .defaultTo('ACTIVE')
                    .alter();
            });
        }
    });
}
