import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.invitations.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');

        t.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('CASCADE');

        t.integer('person_id').unsigned().nullable().references('id').inTable('users').onDelete('CASCADE');

        t.string('email').nullable();
        t.string('phone').nullable();

        t.string('token');

        t.enum('request_type', ['COMPANY', 'BRANCH', 'REGISTRATION']).notNullable();

        t.enum('status', ['PENDING', 'SENT', 'REGISTRED']).notNullable();

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.invitations.tableName);
};
