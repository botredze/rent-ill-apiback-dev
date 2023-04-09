import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.featurePlans.tableName, (t: Knex.TableBuilder) => {
        t.integer('feature_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable(dbNames.features.tableName)
            .onDelete('CASCADE');
        t.integer('plan_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable(dbNames.subscriptionPlans.tableName)
            .onDelete('CASCADE');
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED', 'ARCHIVED']).notNullable().defaultTo('ACTIVE');
        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.featurePlans.tableName);
};
