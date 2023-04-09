import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.document.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');

        t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        t.enum('service_index', ['SIGNITION', 'RENTIL', 'BOARDS']).notNullable();
        t.string('title').nullable();
        t.string('description').nullable();
        t.string('file_name').nullable();
        t.boolean('folder_flag').defaultTo(false);
        t.string('folder_path').nullable();
        t.string('file_extension').nullable();
        t.integer('signs_count').nullable();
        t.jsonb('sign_ids').nullable();
        t.string('valid_till').notNullable();
        t.jsonb('media').notNullable();
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.document.tableName);
};
