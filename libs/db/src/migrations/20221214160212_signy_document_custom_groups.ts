import { SignyConstants } from '@signy/signy';
import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyDocumentCustomGroups.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('creator_id').unsigned().nullable().references('id').inTable(dbNames.users.tableName);
        t.integer('document_id').unsigned().notNullable().references('id').inTable(dbNames.signyDocument.tableName);
        t.string('title').notNullable().index();
        t.string('color').notNullable().defaultTo(SignyConstants.defaultColor);
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['title'], 'title_fulltext', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyDocumentCustomGroups.tableName);
};
