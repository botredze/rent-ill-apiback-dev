import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    await knex.schema.hasColumn(dbNames.users.tableName, 'auth_type').then(async (exists: boolean) => {
        if (exists) {
            await knex.schema
                .alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                    t.enum('auth_type', ['EMAIL', 'FACEBOOK', 'GOOGLE', 'APPLE', 'PHONE']).defaultTo('EMAIL').alter();
                })
                .catch((e) => console.log(e));
        }
    });
    await knex.schema.hasColumn(dbNames.users.tableName, 'phone').then(async (exists: boolean) => {
        if (exists) {
            await knex.schema
                .alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                    t.dropIndex(['phone'], 'users_phone_unique');
                })
                .catch((e) => console.log(e));
            await knex.schema
                .alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                    t.jsonb('phone').alter();
                })
                .catch((e) => console.log(e));
        }
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.hasTable(dbNames.users.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.string('phone', 16).unique().nullable().index().alter();
            });
            await knex.schema.alterTable(dbNames.users.tableName, (t: Knex.TableBuilder) => {
                t.enum('auth_type', ['EMAIL', 'FACEBOOK', 'GOOGLE', 'APPLE']).defaultTo('EMAIL').alter();
            });
        }
    });
};
