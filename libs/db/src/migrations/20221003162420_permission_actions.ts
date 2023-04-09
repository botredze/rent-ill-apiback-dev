import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.permissionActions.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');

        t.integer('role_id').unsigned().nullable().references('id').inTable(dbNames.roles.tableName);

        t.enum('type', [
            'BUILDINGS',
            'APARTMENTS',
            'UNITS',
            'ROOMS',
            'USERS',
            'SERVICE_ORDERS',
            'BOARDS',
            'SIGHNITION',
            'SMS_MODULE',
            'MAIL_MODULE',
        ]).notNullable();

        t.boolean('create').defaultTo(false);
        t.boolean('read').defaultTo(false);
        t.boolean('write').defaultTo(false);
        t.boolean('update').defaultTo(false);
        t.boolean('delete').defaultTo(false);
        t.boolean('reports').defaultTo(false);

        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.permissionActions.tableName);
};
