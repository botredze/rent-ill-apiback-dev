import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.smsInfo.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');

        t.string('message').notNullable();
        t.string('originator').notNullable();

        t.string('additional_info').notNullable();

        t.enum('type', ['PHONE_VERIFICATION', 'RESET_PASSWORD', 'CHANGE_PHONE']).notNullable();

        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.smsInfo.tableName);
};
