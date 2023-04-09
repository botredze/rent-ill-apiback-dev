import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('document_id').unsigned().notNullable().references('id').inTable(dbNames.signyDocument.tableName);
        t.integer('expiration_date').nullable();
        t.integer('reminders_schedule').nullable();
        t.boolean('notify_me').defaultTo(false);
        t.enum('notification_lang', ['EN', 'HE']).notNullable().defaultTo('EN');
        t.boolean('is_show_signature_on').defaultTo(false);
        t.boolean('is_verify_signature_on').defaultTo(false);
        t.boolean('is_same_document_sign').defaultTo(false);
        t.jsonb('brand_logo').nullable();
        t.boolean('horizontal_stack').defaultTo(false);
        t.boolean('is_one_question_on_the_screen').defaultTo(false);
        t.string('background_color').nullable();
        t.integer('blur_percentage').nullable();
        t.boolean('is_allow_return_to_previous_screen').defaultTo(false);
        t.enum('input_location', ['LTR', 'RTL']).notNullable().defaultTo('RTL');
        t.enum('theme', ['AUTO', 'DARK', 'LIGHT']).notNullable().defaultTo('AUTO');
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyDocumentSettings.tableName);
};
