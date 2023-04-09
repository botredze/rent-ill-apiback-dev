import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.featurePlans.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.dropTable(dbNames.featurePlans.tableName);
        }
    });
    await knex.schema.hasTable(dbNames.subscriptionPlans.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.subscriptionPlans.tableName, (t: Knex.TableBuilder) => {
                t.integer('feature_id')
                    .unsigned()
                    .nullable()
                    .references('id')
                    .inTable(dbNames.features.tableName)
                    .after('id');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.subscriptionPlans.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.subscriptionPlans.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('feature_id');
            });
        }
    });
}
