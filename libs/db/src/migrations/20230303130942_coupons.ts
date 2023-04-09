import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.coupons.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.string('coupon', 50).notNullable().index();
        t.integer('plan_id')
            .unsigned()
            .references('id')
            .inTable(dbNames.subscriptionPlans.tableName)
            .onDelete('SET NULL');
        t.integer('amount', 7);
        t.boolean('is_percent').defaultTo(false);
        t.timestamp('expired_at').notNullable();
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');
        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.unique(['coupon']);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.coupons.tableName);
};
