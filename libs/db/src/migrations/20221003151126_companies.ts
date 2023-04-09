import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.companies.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('national_company_id').nullable();
        t.string('name').index();
        t.integer('owner_id').unsigned().notNullable().references('id').inTable(dbNames.users.tableName);

        t.enum('company_type', [
            'APARTMENT_MANAGEMENT',
            'PROPERTY_MANAGEMENT',
            'BUILDING_MAINTANCE_MANAGEMENT',
            'MARKETING_COMPANY',
            'BUILDING_COMUNAL_MANAGEMENT',
            'ASSETS_AGENT',
        ]).notNullable();

        t.integer('address_id').unsigned().nullable().references('id').inTable(dbNames.addresses.tableName);

        t.integer('sms_count').nullable();

        t.boolean('is_sms_auto_renew_only').defaultTo(false);
        t.string('comments').nullable();
        t.jsonb('logo').nullable();
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');
        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['name'], 'name_fulltext_idx', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.companies.tableName);
};
