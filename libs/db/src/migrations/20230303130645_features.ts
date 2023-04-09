import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.features.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.string('name').notNullable().index();
        t.string('hint').nullable();
        t.integer('users_count').nullable();
        t.integer('contacts_count').nullable();
        t.integer('documents_count').nullable();
        t.integer('templates_count').nullable();
        t.integer('mails_count').nullable();
        t.integer('sms_count').nullable();
        t.integer('storage_capacity').nullable();
        t.integer('data_order', 3).defaultTo(0);
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED', 'ARCHIVED']).notNullable().defaultTo('ACTIVE');
        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.features.tableName);
};
