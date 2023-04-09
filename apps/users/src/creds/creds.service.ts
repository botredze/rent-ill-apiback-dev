import { Transaction } from 'objection';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ApiEC, ServiceRpcException } from '@signy/exceptions';
import { CheckPasswordWithHashRequest, PasswordEncodedResponse, PasswordRequest } from '@signy/creds';
import { Credential, User } from '@signy/db';
import { AuthType } from '@signy/auth';

@Injectable()
export class CredsService {
    constructor(@Inject(Credential) private readonly credentialModel: typeof Credential) {}

    passwordEncode({ password }: PasswordRequest): PasswordEncodedResponse {
        const salt = randomBytes(16).toString('hex');
        const hash = pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
        return { salt, hash };
    }

    isPasswordMatch({ password, hash, salt }: CheckPasswordWithHashRequest): boolean {
        const newHash = pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
        return Boolean(hash === newHash);
    }

    async setCredentialsForUser(userId: number, password: string, trx?: Transaction): Promise<boolean> {
        if (!userId || !password) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const { salt, hash } = this.passwordEncode({ password: password });

        await this.credentialModel
            .query(trx)
            .insert({
                user_id: userId,
                salt,
                hash,
            })
            .onConflict()
            .merge({ salt, hash });

        return true;
    }

    async checkCredentials(userId: number, password: string): Promise<boolean> {
        if (!userId || !password) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        const credential = await this.credentialModel.query().findById(userId);

        if (!credential?.salt || !credential?.hash) {
            const user = await User.query().findById(userId);
            if (user?.auth_type === AuthType.Signatory) {
                throw ServiceRpcException(ApiEC.SignatoryUserPasswordNotExists);
            } else {
                throw ServiceRpcException(ApiEC.UserCredentialNotFound);
            }
        }

        return this.isPasswordMatch({ password, hash: credential.hash, salt: credential.salt });
    }

    async checkCredentialsExists(userId: number): Promise<boolean> {
        if (!userId) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }

        return !!(await this.credentialModel.query().findOne({ user_id: userId }));
    }

    async setStaffCredentials(userId: number, hash: string, salt: string): Promise<boolean> {
        if (!hash || !salt) throw ServiceRpcException(ApiEC.WrongInput);

        await this.credentialModel
            .query()
            .insertAndFetch({ user_id: userId, hash, salt })
            .onConflict()
            .merge({ salt, hash });

        return true;
    }
}
