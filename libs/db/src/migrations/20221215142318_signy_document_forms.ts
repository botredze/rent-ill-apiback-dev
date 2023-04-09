import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyDocumentForm.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('input_settings_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable(dbNames.signyDocumentInputSettings.tableName);
        t.integer('document_id').unsigned().notNullable().references('id').inTable(dbNames.signyDocument.tableName);
        t.boolean('is_original_form').defaultTo(false);
        t.string('value').nullable();
        t.jsonb('value_json').nullable();
        t.jsonb('attachments').nullable();
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyDocumentForm.tableName);
};
