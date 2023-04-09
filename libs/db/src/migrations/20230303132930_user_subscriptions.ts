import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.userSubscriptions.tableName, (t: Knex.TableBuilder) => {
        t.integer('user_id').unsigned().primary().references('id').inTable(dbNames.users.tableName).onDelete('CASCADE');

        t.integer('plan_id')
            .unsigned()
            .references('id')
            .inTable(dbNames.subscriptionPlans.tableName)
            .onDelete('SET NULL');

        t.string('subscription_id', 100);

        t.timestamp('start_date').notNullable().defaultTo(knex.fn.now()).index();
        t.timestamp('end_date').index();

        t.enum('status', ['INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID'])
            .notNullable()
            .defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.userSubscriptions.tableName);
};
