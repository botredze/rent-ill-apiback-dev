import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyDocumentInputSettings.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('document_id').unsigned().notNullable().references('id').inTable(dbNames.signyDocument.tableName);
        t.enum('type', [
            'SIGNATURE',
            'INITIALS',
            'TEXT',
            'DROPDOWN',
            'CHECK_BOX',
            'RADIO_BUTTON',
            'DATE_AND_TIME',
            'RATING',
            'ADDRESS',
            'ATTACHMENT',
        ]).notNullable();
        t.boolean('is_required_on').defaultTo(false);
        t.boolean('is_select_checkmark_on').defaultTo(false);
        t.jsonb('contact_recipients').nullable();
        t.jsonb('group_recipients').nullable();
        t.string('placeholder').nullable();
        t.string('hint').nullable();
        t.jsonb('attachments').nullable();
        t.jsonb('signature_color').nullable();
        t.string('field_id').nullable();
        t.enum('validtion_type', ['EMAIL', 'PHONE', 'NATIONAL_ID']).nullable();
        t.integer('validation_min').nullable();
        t.integer('validation_max').nullable();
        t.string('text_font').nullable();
        t.integer('text_size').nullable();
        t.string('text_color').nullable();
        t.integer('text_distance').nullable();
        t.boolean('is_underline_on').defaultTo(false);
        t.boolean('is_italic_on').defaultTo(false);
        t.boolean('is_bold_on').defaultTo(false);
        t.boolean('is_edit_available').defaultTo(false);
        t.enum('float', ['LEFT', 'CENTER', 'RIGHT']).nullable();
        t.jsonb('options_list_data').nullable();
        t.boolean('is_show_labels_on').defaultTo(false);
        t.boolean('is_time').defaultTo(false);
        t.boolean('is_date').defaultTo(false);
        t.boolean('is_duration').defaultTo(false);
        t.enum('date_format', ['SLASH', 'DOT']).nullable();
        t.integer('range_count').nullable();
        t.boolean('is_range_zero').defaultTo(false);
        t.boolean('is_range_one').defaultTo(false);

        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyDocumentInputSettings.tableName);
};
