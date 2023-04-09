import { InvitationStatusTypes, RequestType } from '@signy/common';
import { Model } from 'objection';
import { dbNames } from '../db.names';
import { User } from './user';

export class Invitation extends Model {
    id: number;
    user_id: number;
    person_id?: number | null;
    email?: string | null;
    phone?: string | null;
    token: string;
    request_type: RequestType;
    status: InvitationStatusTypes;

    user?: User;
    person?: User;

    static get tableName() {
        return dbNames.invitations.tableName;
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'token', 'request_type'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: ['null', 'integer'] },
                email: { type: ['null', 'string'] },
                phone: { type: ['null', 'string'] },
                token: { type: 'string' },
                request_type: { enum: Object.values(RequestType) },
                status: { enum: Object.values(InvitationStatusTypes), default: InvitationStatusTypes.Pending },
            },
        };
    }
}
