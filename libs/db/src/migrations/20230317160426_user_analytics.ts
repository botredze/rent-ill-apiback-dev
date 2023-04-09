import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.userAnalytics.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable(dbNames.users.tableName)
            .onDelete('CASCADE');

        t.integer('documents_count').notNullable().defaultTo(0);
        t.integer('sms_count').notNullable().defaultTo(0);
        t.integer('users_count').notNullable().defaultTo(0);
        t.integer('templates_count').notNullable().defaultTo(0);
        t.integer('storage_capacity_used').notNullable().defaultTo(0);

        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.unique(['user_id'], { indexName: 'unique_user' });
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.userAnalytics.tableName);
};
