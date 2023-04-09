import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyDocumentAudit.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('user_id').unsigned().notNullable().references('id').inTable(dbNames.users.tableName);
        t.integer('document_id').unsigned().notNullable().references('id').inTable(dbNames.signyDocument.tableName);
        t.integer('signatory_id')
            .unsigned()
            .nullable()
            .references('id')
            .inTable(dbNames.signyDocumentSignatories.tableName);
        t.enum('action_type', ['PREPARE', 'SIGNING', 'REVIEW', 'COMPLETED']).notNullable().defaultTo('PREPARE');
        t.string('ip').nullable();
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyDocumentAudit.tableName);
};
