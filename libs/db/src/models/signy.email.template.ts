import { StatusType } from '@signy/common';
import { EmailTemplateBaseInfo } from '@signy/signy-email';
import { UploadedFileInfo, UploadedImageInfo } from '@signy/upload';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { User } from './user';

export class SignyEmailTemplate extends Model {
    id: number;
    user_id: number;
    template: string;
    file_urls?: UploadedFileInfo[] | null;
    company_logo?: UploadedImageInfo | null;
    status: StatusType;

    user?: User | null;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyEmailTemplates.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                template: { type: 'string' },
                file_urls: { type: ['null', 'array'] },
                company_logo: { type: ['null', 'object'] },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyEmailTemplate;
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
                    from: `${dbNames.signyEmailTemplates.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
        };
    }

    toEmailTemplateBaseInfo(): EmailTemplateBaseInfo {
        return {
            id: this.id,
            template: this.template,
            files: this.file_urls,
            companyLogo: this.company_logo,
        };
    }
}
