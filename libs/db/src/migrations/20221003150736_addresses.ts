import { geoConstants } from '@signy/common';
import { Knex } from 'knex';
import { dbNames } from '../db.names';

export const up = async (knex: Knex): Promise<void> => {
    const updateStamp = knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await knex.schema.createTable(dbNames.addresses.tableName, (t: Knex.TableBuilder) => {
        t.increments('id');
        t.string('country_name');
        t.string('city_name');
        t.string('street_name');
        t.string('area_name');
        t.integer('block_number').nullable();
        t.string('entry').nullable();
        t.string('zip_code');
        t.float('longitude', 11, 7).defaultTo(0);
        t.float('latitude', 11, 7).defaultTo(0);

        t.specificType(
            'coords',
            `POINT GENERATED ALWAYS AS (ST_GEOMFROMTEXT(CONCAT("POINT(", latitude," ", longitude ,")"), ${geoConstants.defaultSRID})) STORED NOT NULL`
        ).index();
        t.enum('status', ['ACTIVE', 'DISABLED', 'DELETED']).notNullable().defaultTo('ACTIVE');
        t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
    });
};

export const down = async (knex: Knex): Promise<void> => {
    await knex.schema.dropTableIfExists(dbNames.addresses.tableName);
};
