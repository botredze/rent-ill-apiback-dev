import { ServiceTypes } from '@signy/common';
import { UploadedMediaInfo } from '@signy/upload';
import { StatusType } from '@signy/common';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { Signs } from './signs';
import { User } from './user';

export class Document extends Model {
    id: number;
    user_id: number;
    service_index: ServiceTypes;
    title?: string | null;
    description?: string | null;
    file_name?: string | null;
    folder_flag: boolean;
    folder_path?: string | null;
    file_extension?: string | null;
    signs_count?: number | null;
    sign_ids: number[] | null;
    valid_till: Date | string;
    media: UploadedMediaInfo;
    status: StatusType;

    user?: User;
    signs?: Signs[];

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.document.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'service_index'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                service_index: { enum: Object.values(ServiceTypes) },
                title: { type: ['null', 'string'] },
                description: { type: ['null', 'string'] },
                file_name: { type: ['null', 'string'] },
                folder_flag: { type: 'boolean' },
                folder_path: { type: ['null', 'string'] },
                file_extension: { type: ['null', 'string'] },
                signs_count: { type: ['null', 'integer'] },
                sign_ids: { type: ['null', 'array'] },
                valid_till: { type: ['string', 'date'] },
                media: { type: ['null', 'object'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = Document;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${dbNames.document.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            signs: {
                relation: Model.HasManyRelation,
                modelClass: Signs,
                join: {
                    from: `${dbNames.document.tableName}.id`,
                    to: `${dbNames.signs.tableName}.documnet_id`,
                },
            },
        };
    }
}
