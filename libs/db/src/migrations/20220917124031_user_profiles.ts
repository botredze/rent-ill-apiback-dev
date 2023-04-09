import { Knex } from 'knex';
import { commonConstants, geoConstants } from '@signy/common';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');

        t.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users').onDelete('CASCADE');

        // Personal Info
        t.string('first_name').index();
        t.string('last_name').index();
        t.string('user_name').index();

        t.jsonb('avatar');

        // Preferences
        t.string('location');

        t.float('longitude', 11, 7).defaultTo(0);
        t.float('latitude', 11, 7).defaultTo(0);

        t.specificType(
            'coords',
            `POINT GENERATED ALWAYS AS (ST_GEOMFROMTEXT(CONCAT("POINT(", latitude," ", longitude ,")"), ${geoConstants.defaultSRID})) STORED NOT NULL`
        )
            .notNullable()
            .index();

        t.string('time_zone', commonConstants.maxTimeZoneLength).notNullable().defaultTo('UTC');

        t.boolean('is_messages_on').notNullable().defaultTo(false);

        // Experience

        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);

        t.index(['first_name', 'last_name'], 'full_name_fulltext', 'FULLTEXT');
        t.index(['location'], 'location_fulltext_idx', 'FULLTEXT');
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.userProfiles.tableName);
};
