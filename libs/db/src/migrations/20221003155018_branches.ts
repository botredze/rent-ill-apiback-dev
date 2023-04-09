import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.branches.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');

        t.string('name').index();

        t.integer('company_id').unsigned().nullable().references('id').inTable(dbNames.companies.tableName);

        t.integer('address_id').unsigned().nullable().references('id').inTable(dbNames.addresses.tableName);

        t.string('comments').nullable();

        t.jsonb('logo').nullable();

        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['name'], 'name_fulltext_idx', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.branches.tableName);
};
