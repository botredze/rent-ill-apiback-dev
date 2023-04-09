import { geoConstants } from '@signy/common';
import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.userProfiles.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema
                .alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                    t.specificType(
                        'coords',
                        `POINT GENERATED ALWAYS AS (ST_GEOMFROMTEXT(CONCAT("POINT(", latitude," ", longitude ,")"), ${geoConstants.defaultSRID})) STORED NOT NULL`
                    )
                        .nullable()
                        .index()
                        .alter();
                })
                .catch((e) => console.log(e));
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.userProfiles.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.specificType(
                    'coords',
                    `POINT GENERATED ALWAYS AS (ST_GEOMFROMTEXT(CONCAT("POINT(", latitude," ", longitude ,")"), ${geoConstants.defaultSRID})) STORED NOT NULL`
                )
                    .index()
                    .alter();
            });
        }
    });
}
