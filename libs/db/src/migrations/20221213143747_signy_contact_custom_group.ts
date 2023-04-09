import { SignyConstants } from '@signy/signy';
import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyContactCustomGroup.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('owner_id').unsigned().notNullable().references('id').inTable(dbNames.users.tableName);
        t.jsonb('contact_ids').nullable();
        t.boolean('is_sign_order_exists').defaultTo(false);
        t.string('name').notNullable().index();
        t.string('color').notNullable().defaultTo(SignyConstants.defaultColor);
        t.boolean('is_custom').defaultTo(true);
        t.string('icon').nullable();
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['name'], 'name_fulltext', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyContactCustomGroup.tableName);
};
