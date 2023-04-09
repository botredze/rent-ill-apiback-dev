import { StatusType } from '@signy/common';
import {
    ReadStatusTypes,
    SignatoryBaseInfo,
    SignatoryRoleTypes,
    SignatureTypes,
    SigningStatusTypes,
    SignyConstants,
} from '@signy/signy';
import { UploadedFileInfo, UploadedImageInfo } from '@signy/upload';
import { AnyQueryBuilder, Model } from 'objection';
import { dbNames } from '../db.names';
import { SignyContact } from './signy.contact';
import { SignyDocument } from './signy.document';
import { User } from './user';

export class SignyDocumentSignatories extends Model {
    id: number;
    document_id: number;
    contact_id?: number;
    user_id?: number;
    temp_user_id?: number;
    sign_order_queue?: number | null;
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    telegram?: string;
    telegram_nick?: string;
    is_2fa_on: boolean;
    is_2fa_verified: boolean;
    is_password_on: boolean;
    read_status: ReadStatusTypes;
    pass_code?: string;
    is_selfie_with_id_on: boolean;
    drawn_sign_file?: UploadedImageInfo[] | null;
    digital_signature?: string;
    ssl_files?: UploadedFileInfo | null;
    is_video_record_on?: boolean;
    video_phrase?: string;
    color: string;
    date_of_sign?: Date | string;
    is_visible: boolean;
    roles: SignatoryRoleTypes;
    signature_type: SignatureTypes;
    signing_status: SigningStatusTypes;
    status: StatusType;

    document?: SignyDocument;
    user?: User;
    contact?: SignyContact;

    static get idColumn(): string {
        return 'id';
    }

    static get tableName() {
        return dbNames.signyDocumentSignatories.tableName;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['document_id'],

            properties: {
                id: { type: 'integer' },
                document_id: { type: 'integer' },
                contact_id: { type: ['null', 'integer'] },
                user_id: { type: ['null', 'integer'] },
                temp_user_id: { type: ['null', 'integer'] },
                sign_order_queue: { type: ['null', 'integer'], default: 1 },
                name: { type: ['null', 'string'] },
                email: { type: ['null', 'string'] },
                phone: { type: ['null', 'string'] },
                whatsapp: { type: ['null', 'string'] },
                telegram: { type: ['null', 'string'] },
                telegram_nick: { type: ['null', 'string'] },
                is_2fa_on: { type: 'boolean', default: false },
                is_2fa_verified: { type: 'boolean', default: false },
                is_password_on: { type: 'boolean', default: false },
                read_status: { enum: Object.values(ReadStatusTypes), default: ReadStatusTypes.NotSent },
                pass_code: { type: ['null', 'string'] },
                is_selfie_with_id_on: { type: 'boolean', default: false },
                drawn_sign_file: { type: ['null', 'array'] },
                digital_signature: { type: ['null', 'string'] },
                ssl_files: { type: ['null', 'object'] },
                is_video_record_on: { type: 'boolean', default: false },
                video_phrase: { type: ['null', 'string'] },
                color: { type: 'string', default: SignyConstants.defaultColor },
                date_of_sign: { type: 'string' },
                is_visible: { type: 'boolean', default: false },
                roles: { enum: Object.values(SignatoryRoleTypes), default: SignatoryRoleTypes.Signer },
                signature_type: { enum: Object.values(SignatureTypes), default: SignatureTypes.Simple },
                signing_status: { enum: Object.values(SigningStatusTypes), default: SigningStatusTypes.Pending },
                status: { enum: Object.values(StatusType), default: StatusType.Active },
            },
        };
    }
    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentSignatories;
                builder.where(ref('status'), StatusType.Active);
            },
            [SigningStatusTypes.AskForReview](builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentSignatories;
                builder.where(ref('signing_status'), SigningStatusTypes.AskForReview);
            },
            [SigningStatusTypes.Canceled](builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentSignatories;
                builder.where(ref('signing_status'), SigningStatusTypes.Canceled);
            },
            [SigningStatusTypes.Done](builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentSignatories;
                builder.where(ref('signing_status'), SigningStatusTypes.Done);
            },
            [SigningStatusTypes.Pending](builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentSignatories;
                builder.where(ref('signing_status'), SigningStatusTypes.Pending);
            },
            [SigningStatusTypes.Rejected](builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentSignatories;
                builder.where(ref('signing_status'), SigningStatusTypes.Rejected);
            },
            [SigningStatusTypes.Signed](builder: AnyQueryBuilder) {
                const { ref } = SignyDocumentSignatories;
                builder.where(ref('signing_status'), SigningStatusTypes.Signed);
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
                    from: `${dbNames.signyDocumentSignatories.tableName}.user_id`,
                    to: `${dbNames.users.tableName}.id`,
                },
            },
            contact: {
                relation: Model.HasOneRelation,
                modelClass: SignyContact,
                join: {
                    from: `${dbNames.signyDocumentSignatories.tableName}.contact_id`,
                    to: `${dbNames.signyContact.tableName}.id`,
                },
            },
            document: {
                relation: Model.HasOneRelation,
                modelClass: SignyDocument,
                join: {
                    from: `${dbNames.signyDocumentSignatories.tableName}.document_id`,
                    to: `${dbNames.signyDocument.tableName}.id`,
                },
            },
        };
    }

    toSignatoryBaseInfo(): SignatoryBaseInfo {
        return {
            id: this.id,
            contactId: this.contact_id,
            documentId: this.document_id,
            tempUserId: this.temp_user_id,
            signOrderQueue: this?.sign_order_queue,
            name: this.name,
            email: this.email,
            phone: this.phone,
            whatsapp: this.whatsapp,
            telegram: this.telegram,
            telegramNick: this.telegram_nick,
            is2faOn: !!this.is_2fa_on,
            is2faVerified: !!this.is_2fa_verified,
            isPasswordOn: !!this.is_password_on,
            readStatus: this.read_status,
            passCode: this.pass_code,
            isSelfieWithIdOn: !!this.is_selfie_with_id_on,
            drawnSignFile: this.drawn_sign_file,
            digitalSignature: this.digital_signature,
            sslFiles: this.ssl_files,
            isVideoRecordOn: !!this.is_video_record_on,
            videoPhrase: this.video_phrase,
            nationalId: this?.user?.national_id,
            color: this.color,
            dateOfSign: this.date_of_sign,
            isVisible: !!this.is_visible,
            roles: this.roles,
            signatureType: this.signature_type,
            signingStatus: this.signing_status,
        };
    }
}
