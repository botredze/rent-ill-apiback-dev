import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.subscriptionPlans.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.string('title', 100).notNullable().index();
        t.string('description').nullable();
        t.integer('cost', 7).defaultTo(0);
        t.integer('term', 3).unsigned().nullable();
        t.float('discount_percantage').nullable();
        t.string('term_type', 20).nullable();
        t.boolean('is_limited').defaultTo(false);
        t.integer('data_order', 2).defaultTo(0);
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED', 'PROCESSING']).notNullable().defaultTo('ACTIVE');
        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.subscriptionPlans.tableName);
};
