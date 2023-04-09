import { commonConstants } from '@signy/common';
import { Knex } from 'knex';
import { dbNames } from '../db.names';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.string('drive_original_file_path')
                    .nullable()
                    .defaultTo(commonConstants.defaultDriveOriginalFilePath)
                    .after('input_location');
            });
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.string('drive_signed_file_path')
                    .nullable()
                    .defaultTo(commonConstants.defaultDriveSignedFilePath)
                    .after('drive_original_file_path');
            });
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.boolean('is_drive_synchronization_on').defaultTo(false).after('drive_signed_file_path');
            });
        }
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.hasTable(dbNames.signyDocumentSettings.tableName).then(async (exists: boolean) => {
        if (exists) {
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('drive_original_file_path');
            });
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('drive_signed_file_path');
            });
            await knex.schema.alterTable(dbNames.signyDocumentSettings.tableName, (t: Knex.TableBuilder) => {
                t.dropColumn('is_drive_synchronization_on');
            });
        }
    });
}
