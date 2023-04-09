import { SignyConstants } from '@signy/signy';
import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.signyDocumentSignatories.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.integer('document_id').unsigned().notNullable().references('id').inTable(dbNames.signyDocument.tableName);
        t.integer('contact_id').unsigned().nullable().references('id').inTable(dbNames.signyContact.tableName);
        t.integer('user_id').unsigned().nullable().references('id').inTable(dbNames.users.tableName);
        t.integer('temp_user_id').nullable().unique().index();
        t.integer('sign_order_queue').nullable().index();
        t.string('name').nullable().index();
        t.string('email').nullable().index();
        t.string('phone').nullable().index();
        t.string('whatsapp').nullable().index();
        t.string('telegram').nullable().index();
        t.string('telegram_nick').nullable().index();
        t.boolean('is_2fa_on').defaultTo(false);
        t.boolean('is_2fa_verified').defaultTo(false);
        t.boolean('is_password_on').defaultTo(false);
        t.string('pass_code').nullable();
        t.boolean('is_selfie_with_id_on').defaultTo(false);
        t.jsonb('drawn_sign_file').nullable();
        t.string('digital_signature').nullable();
        t.jsonb('ssl_files').nullable();
        t.boolean('is_video_record_on').defaultTo(false);
        t.string('video_phrase').nullable();
        t.string('color').notNullable().defaultTo(SignyConstants.defaultColor);
        t.string('date_of_sign').nullable();
        t.enum('roles', ['SIGNER', 'VALIDATOR', 'VIEWER']).notNullable().defaultTo('SIGNER');
        t.enum('signature_type', ['DIGITAL', 'SIMPLE']).notNullable().defaultTo('SIMPLE');
        t.enum('signing_status', ['REJECTED', 'ASK_FOR_REVIEW', 'PENDING', 'SIGNED', 'DONE', 'CANCELED'])
            .notNullable()
            .defaultTo('PENDING');
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['name'], 'name_fulltext', 'FULLTEXT');
        t.index(['email'], 'email_fulltext', 'FULLTEXT');
        t.index(['phone'], 'phone_fulltext', 'FULLTEXT');
        t.index(['whatsapp'], 'whatsapp_fulltext', 'FULLTEXT');
        t.index(['telegram'], 'telegram_fulltext', 'FULLTEXT');
        t.index(['telegram_nick'], 'telegram_nick_fulltext', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.signyDocumentSignatories.tableName);
};
