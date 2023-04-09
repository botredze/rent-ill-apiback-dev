import { StatusType } from '@signy/common';
import { SignyEmailTypes } from '@signy/signy-email';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyDocument } from './signy.document';
import { SignyDocumentSignatories } from './signy.document.signatories';
import { SignyEmailTemplate } from './signy.email.template';
import { User } from './user';

export class SignyEmail extends Model {
    id: number;
    document_id: number;
    signy_email_template_id: number;
    signatory_id?: number;
    user_id?: number;
    channel: string;
    email_type: SignyEmailTypes;
    is_sent: boolean;
    expired_at: string;
    sent_at: string;
    status: StatusType;

    document?: SignyDocument;
    signatory?: SignyDocumentSignatories | null;
    emailTemplate?: SignyEmailTemplate;
    user?: User | null;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyEmail.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['document_id', 'channel'],

            properties: {
                id: { type: 'integer' },
                document_id: { type: 'integer' },
                signy_email_template_id: { type: 'integer' },
                signatory_id: { type: ['null', 'integer'] },
                user_id: { type: ['null', 'integer'] },
                channel: { type: 'string' },
                email_type: { enum: Object.values(SignyEmailTypes), default: SignyEmailTypes.Pending },
                is_sent: { type: 'boolean' },
                expired_at: { type: 'string' },
                sent_at: { type: 'string' },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyEmail;
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
                    from: `${dbNames.signyEmail.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signyEmail.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
            signatory: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocumentSignatories,
                join: {
                    from: `${dbNames.signyEmail.tableName}.signatory_id`,
                    to: `${dbNames.signyDocumentSignatories.tableName}.id`,
                },
            },
            emailTemplate: {
                relation: Model.HasOneRelation,
                modelClass: SignyEmailTemplate,
                join: {
                    from: `${dbNames.signyEmail.tableName}.signy_email_template_id`,
                    to: `${dbNames.signyEmailTemplates.tableName}.id`,
                },
            },
        };
    }
}
