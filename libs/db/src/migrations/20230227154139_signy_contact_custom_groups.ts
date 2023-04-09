import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyContactCustomGroup.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyContactCustomGroup.tableName, (t: Knex.TableBuilder) => {
                t.integer('sign_order_queue').nullable().after('contact_ids');
                t.dropColumn('is_sign_order_exists');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyContactCustomGroup.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyContactCustomGroup.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('sign_order_queue');
            });
        }
    });
}
