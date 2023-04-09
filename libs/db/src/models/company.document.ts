import { StatusType } from '@signy/common';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { Branch } from './branches';
import { Company } from './company';
import { SignyDocument } from './signy.document';

export class SignyCompanyDocument extends Model {
    id: number;
    company_id?: number;
    branch_id?: number;
    document_id: number;
    status: StatusType;

    company?: Company | null;
    branch?: Branch | null;
    document?: SignyDocument;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyCompanyDocument.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['document_id'],

            properties: {
                id: { type: 'integer' },
                company_id: { type: ['null', 'integer'] },
                branch_id: { type: ['null', 'integer'] },
                document_id: { type: 'integer' },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyCompanyDocument;
                builder.where(ref('status'), StatusType.Active);
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static get relationMappings(): Record<string, any> {
        return {
            company: {
                relation: Model.HasOneRelation,
                modelClass: Company,
                join: {
                    from: `${dbNames.signyCompanyDocument.tableName}.company_id`,
                    to: `${dbNames.companies.tableName}.id`,
                },
            },
            branch: {
                relation: Model.HasOneRelation,
                modelClass: Branch,
                join: {
                    from: `${dbNames.signyCompanyDocument.tableName}.branch_id`,
                    to: `${dbNames.branches.tableName}.id`,
                },
            },
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signyCompanyDocument.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
        };
    }
}
