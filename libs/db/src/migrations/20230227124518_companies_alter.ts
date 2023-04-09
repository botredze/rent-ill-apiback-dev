import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.companies.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.companies.tableName, (t: Knex.TableBuilder) => {
                t.enum('company_type', [
                    'APARTMENT_MANAGEMENT',
                    'PROPERTY_MANAGEMENT',
                    'BUILDING_MAINTANCE_MANAGEMENT',
                    'MARKETING_COMPANY',
                    'BUILDING_COMUNAL_MANAGEMENT',
                    'ASSETS_AGENT',
                    'OTHER',
                ])
                    .notNullable()
                    .defaultTo('OTHER')
                    .alter();
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.companies.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.companies.tableName, (t: Knex.TableBuilder) => {
                t.enum('company_type', [
                    'APARTMENT_MANAGEMENT',
                    'PROPERTY_MANAGEMENT',
                    'BUILDING_MAINTANCE_MANAGEMENT',
                    'MARKETING_COMPANY',
                    'BUILDING_COMUNAL_MANAGEMENT',
                    'ASSETS_AGENT',
                ])
                    .notNullable()
                    .alter();
            });
        }
    });
}
