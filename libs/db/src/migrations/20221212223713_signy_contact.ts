import { SignyConstants } from '@signy/signy';
import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyContact.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('owner_id').unsigned().notNullable().references('id').inTable(dbNames.users.tableName);
        t.jsonb('group_ids').nullable();
        t.integer('company_id').unsigned().nullable().references('id').inTable(dbNames.companies.tableName);
        t.integer('branch_id').unsigned().nullable().references('id').inTable(dbNames.branches.tableName);
        t.enum('type', ['GOOGLE', 'INTERNAL', 'CSV']).notNullable().defaultTo('INTERNAL').index();
        t.string('first_name').nullable().index();
        t.string('last_name').nullable().index();
        t.string('email').nullable().unique().index();
        t.string('phone').nullable().unique().index();
        t.string('whatsapp').nullable().index();
        t.string('telegram').nullable().index();
        t.string('telegram_nick').nullable().index();
        t.boolean('is_favourite').defaultTo(false);
        t.string('avatar').nullable();
        t.enum('gender', ['MALE', 'FEMALE', 'OTHER']).nullable().index();
        t.string('dob').nullable().index();
        t.string('color').defaultTo(SignyConstants.defaultColor);
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['first_name', 'last_name'], 'full_name_fulltext', 'FULLTEXT');
        t.index(['email'], 'email_fulltext', 'FULLTEXT');
        t.index(['phone'], 'phone_fulltext', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyContact.tableName);
};
