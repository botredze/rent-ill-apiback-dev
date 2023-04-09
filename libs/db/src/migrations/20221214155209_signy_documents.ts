import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyDocument.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('creator_id').unsigned().notNullable().references('id').inTable(dbNames.users.tableName);
        t.boolean('is_template').defaultTo(false);
        t.boolean('is_form').defaultTo(false);
        t.enum('step_type', ['PREPARE', 'SIGNING', 'REVIEW', 'COMPLETED']).notNullable().defaultTo('PREPARE');
        t.jsonb('original_file').notNullable();
        t.jsonb('file').nullable();
        t.jsonb('form_image').nullable();
        t.jsonb('folower_ids').nullable();
        t.string('name').nullable().index();
        t.integer('size').nullable();
        t.dateTime('upload_date').notNullable().defaultTo(knex.fn.now());
        t.jsonb('extra_data').nullable();
        t.jsonb('attachments').nullable();
        t.integer('step_level').notNullable().defaultTo(1);
        t.jsonb('custom_groups_ids').nullable();
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['name'], 'name_fulltext', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyDocument.tableName);
};
