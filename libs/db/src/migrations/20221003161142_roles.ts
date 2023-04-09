import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.roles.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');

        t.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users').onDelete('CASCADE');

        t.integer('company_id').unsigned().nullable().references('id').inTable(dbNames.companies.tableName);

        t.integer('branch_id').unsigned().nullable().references('id').inTable(dbNames.branches.tableName);

        t.string('name').index();

        t.string('sub_type_name').nullable().index();

        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['name'], 'name_fulltext_idx', 'FULLTEXT');
        t.index(['sub_type_name'], 'sub_type_name_fulltext_idx', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.roles.tableName);
};
