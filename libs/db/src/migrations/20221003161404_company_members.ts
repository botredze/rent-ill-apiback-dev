import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.companyMembers.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');

        t.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users').onDelete('CASCADE');

        t.integer('role_id').unsigned().nullable().references('id').inTable(dbNames.roles.tableName);

        t.integer('company_id').unsigned().notNullable().references('id').inTable(dbNames.companies.tableName);

        t.integer('branch_id').unsigned().nullable().references('id').inTable(dbNames.branches.tableName);

        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.companyMembers.tableName);
};
