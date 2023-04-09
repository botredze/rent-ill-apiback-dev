import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.userCoupons.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable(dbNames.users.tableName)
            .onDelete('CASCADE');
        t.integer('coupon_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable(dbNames.coupons.tableName)
            .onDelete('CASCADE');

        t.date('date').notNullable().index();

        t.enum('status', ['USED', 'DELETED']).notNullable().defaultTo('USED');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.unique(['user_id', 'coupon_id'], { indexName: 'unique_user_coupon' });
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.userCoupons.tableName);
};
