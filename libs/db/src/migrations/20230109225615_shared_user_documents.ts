import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signySharedUserDocument.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('document_id').unsigned().notNullable().references('id').inTable(dbNames.signyDocument.tableName);
        t.integer('signy_signatory_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable(dbNames.signyDocumentSignatories.tableName);
        t.enum('channel_type', ['EMAIL', 'PHONE', 'WHATSAPP', 'TELEGRAM']).notNullable().defaultTo('EMAIL');
        t.boolean('is_progress_notify_follower').defaultTo(false);
        t.boolean('is_sent').defaultTo(false);
        t.timestamp('expired_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('sent_at').notNullable().defaultTo(knex.fn.now());
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signySharedUserDocument.tableName);
};
