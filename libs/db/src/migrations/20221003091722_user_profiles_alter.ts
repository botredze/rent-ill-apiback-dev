import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.userProfiles.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.enum('suffix', ['MR', 'MRS', 'MISS', 'MS', 'MX', 'SIR', 'DR']).nullable();
            });
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.date('date_of_birth').nullable();
            });
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.enum('gender', ['MALE', 'FEMALE', 'OTHER']).nullable();
            });
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.renameColumn('is_messages_on', 'is_notifications_on');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.userProfiles.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('suffix');
            });
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('date_of_birth');
            });
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('gender');
            });
            await knex.schema.alterTable(dbNames.userProfiles.tableName, (t: Knex.TableBuilder) => {
                t.renameColumn('is_notifications_on', 'is_messages_on');
            });
        }
    });
}
