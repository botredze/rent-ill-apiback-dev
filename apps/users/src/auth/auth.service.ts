import { lastValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CredsService } from '../creds/creds.service';
import { SessionService } from '../sessions/session.service';
import { ProfileService } from '../profile/profile.service';
import { ServiceRpcException, ApiSuccessResponse, ApiException } from '@signy/exceptions';
import { User, ResetPasswordToken, SignyDocumentSignatories } from '@signy/db';
import {
    AuthCreateSessionRequest,
    AuthSessionUserResponse,
    AuthSignInRequest,
    AuthSignUpRequest,
    AuthSuccessResponse,
    CheckUserExistsRequest,
    CheckUserExistsResponse,
    ExternalUserInfo,
    RecoverPasswordRequest,
    ResetPasswordOTPRequest,
    ResetPasswordOTPResponse,
    ResetPasswordRequest,
    authConstants,
    AuthType,
    SignUpByInvitationRequest,
    AuthSignUpRequestInternal,
} from '@signy/auth';
import { ApiEC } from '@signy/exceptions';
import { UserIdRequest } from '@signy/common';
import {
    AuthSessionUserRequest,
    ChangeEmailRequest,
    ChangePasswordRequest,
    CheckPasswordRequest,
    CheckPasswordResponse,
    DeleteUserAccountResponse,
    SetFcmTokenRequest,
    SetTermsAndPolicyRequest,
} from '@signy/user';
import {} from '@signy/exceptions';
import { OtpCodeResponse, ResendOtpCodeRequest, VerificationCodeRequest } from '@signy/verification';
import { OtpEventType, OtpType } from '@signy/otp';
import {
    ChannelCodeWithOtpTypeRequest,
    ChannelOtpTypeForcedRequest,
    IsOtpCodeValidResponse,
    OtpTypeRequest,
    VerifyOtpCodeRequest,
    VerifyOtpCodeResponse,
} from '@signy/otp';
import { SendEmailRequest } from '@signy/email';
import { EmailEventType, EmailType } from '@signy/email';
import { StatusType } from '@signy/common';
import Objection, { AnyQueryBuilder } from 'objection';
import dayjs from 'dayjs';

@Injectable()
export class AuthService {
    constructor(
        @Inject('AUTH_SERVICE') private natsClient: ClientProxy,
        @Inject(User) private readonly userModel: typeof User,
        @Inject(ResetPasswordToken) private readonly resetPasswordTokenModel: typeof ResetPasswordToken,
        private readonly credsService: CredsService,
        private readonly sessionService: SessionService,
        private readonly profileService: ProfileService
    ) {}

    async getUser({ email, phone }: CheckUserExistsRequest): Promise<User> {
        if (!email && !phone) {
            throw new ApiException(ApiEC.WrongInput);
        }

        let user: User | undefined;

        if (email) {
            user = await this.userModel
                .query()
                .modify('active')
                .withGraphJoined('profile')
                .where({ email })
                .orWhere({ ext_user_email: email })
                .first();
        } else if (phone) {
            user = (await this.userModel.query().modify('active').withGraphJoined('profile')).find((x) => {
                return x?.phone?.length && x?.phone.includes(phone);
            });
        }
        if (!user) {
            throw ServiceRpcException(ApiEC.UserNotFound);
        }
        return user;
    }

    async checkUserExists({ email, phone }: CheckUserExistsRequest): Promise<CheckUserExistsResponse> {
        if (!email && !phone) {
            throw new ApiException(ApiEC.WrongInput);
        }

        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        let exists: boolean = false;
        if (email) {
            exists = !!(await this.userModel.query().select('email').findOne({ email }));
        } else if (phone) {
            exists = !!(await this.userModel.query().modify('active')).find((x) => {
                return x?.phone?.length && x?.phone.includes(phone);
            });
        }

        const foundSignatory = await SignyDocumentSignatories.query()
            .modify('active')
            .findOne((cb: AnyQueryBuilder) => {
                if (email) {
                    cb.findOne({ email });
                }

                if (phone) {
                    cb.findOne({ phone });
                }
            });

        let isPasswordExists = false;
        if (foundSignatory?.user_id) {
            isPasswordExists = await this.credsService.checkCredentialsExists(foundSignatory.user_id);
        }

        return { exists, isSignatory: !!foundSignatory, isPasswordExists };
    }

    async getUserById({ userId }: UserIdRequest): Promise<User> {
        const user = await this.userModel
            .query()
            .modify('active')
            .withGraphJoined('[profile, session, signatory]')
            .findOne({ 'users.id': userId });

        if (!user) {
            throw ServiceRpcException(ApiEC.UserNotFound);
        }

        return user;
    }

    async getUserByEmail({ email }: CheckUserExistsRequest): Promise<User> {
        const user = await this.userModel.query().modify('active').withGraphJoined('profile').findOne({ email });
        if (!user) {
            throw ServiceRpcException(ApiEC.UserNotFound);
        }
        return user;
    }

    async getSessionUserById({ userId, sessionToken }: AuthSessionUserRequest): Promise<AuthSessionUserResponse> {
        return { sessionUser: { ...(await this.getUserById({ userId }))?.toSessionUserInfoDTO(), sessionToken } };
    }

    async getUserBySessionToken(dto: AuthSessionUserRequest): Promise<AuthSessionUserResponse> {
        return this.sessionService.getUserBySessionToken(dto);
    }

    async getUserByCredentials({ email, password, phone }: AuthSignInRequest): Promise<AuthSessionUserResponse> {
        let user: User | undefined;
        if (email) {
            user = await this.getUser({ email });
        } else if (phone) {
            user = await this.getUser({ phone });
        }

        if (!user) {
            throw ServiceRpcException(ApiEC.IncorrectEmailOrPassword);
        }
        if (!(await this.credsService.checkCredentials(user.id, password))) {
            throw ServiceRpcException(ApiEC.WrongPassword);
        }
        return { sessionUser: user.toSessionUserInfoDTO() };
    }

    async signUpLocal({ email, password, deviceId, phone }: AuthSignUpRequest): Promise<AuthSuccessResponse> {
        if (!email && !phone) {
            throw new ApiException(ApiEC.WrongInput);
        }

        const externalUserExists = email
            ? await this.userModel.query().modify('active').findOne({ ext_user_email: email })
            : await this.userModel.query().modify('active').findOne({ ext_user_phone: phone });
        if (externalUserExists) {
            await this.credsService.setCredentialsForUser(externalUserExists.id, password);

            return this.sessionService.createUserSession(externalUserExists, null, deviceId);
        }

        let exists: boolean;
        if (email) {
            exists = (await this.checkUserExists({ email })).exists;
        } else {
            exists = (await this.checkUserExists({ phone })).exists;
        }
        if (exists) {
            if (email) {
                throw ServiceRpcException(ApiEC.EmailAlreadyRegistered);
            } else if (phone) {
                throw ServiceRpcException(ApiEC.PhoneAlreadyRegistered);
            }
        }

        const trx = await this.userModel.startTransaction();
        let user: User | null;
        try {
            const externalUserExists = email
                ? await this.userModel.query(trx).modify('active').findOne({ ext_user_email: email })
                : await this.userModel.query(trx).modify('active').findOne({ ext_user_phone: phone });

            user = email
                ? await this.userModel.query(trx).insert({
                      auth_type: AuthType.Email,
                      is_terms_policy_accepted: true,
                      is_email_verified: externalUserExists ? true : false,
                      email,
                  })
                : phone
                ? await this.userModel.query(trx).insert({
                      auth_type: AuthType.Phone,
                      is_terms_policy_accepted: true,
                      is_phone_verified: externalUserExists ? true : false,
                      phone: [phone],
                  })
                : null;

            if (!user) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }

            await this.credsService.setCredentialsForUser(user.id, password, trx);

            await this.profileService.createUserProfile(
                { userId: user.id, extUserId: externalUserExists?.id || undefined },
                trx
            );

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        return this.sessionService.createUserSession(user, null, deviceId);
    }

    async signIn({ userId, fcmToken, deviceId }: AuthCreateSessionRequest): Promise<AuthSuccessResponse> {
        const user = await this.userModel.query().modify('active').withGraphJoined('profile').findById(userId);
        if (!user) {
            throw ServiceRpcException(ApiEC.UserNotFound);
        }
        return this.sessionService.createUserSession(user, fcmToken, deviceId);
    }

    async acceptTermsPolicy({
        userId,
        sessionToken,
        setTermsPolicyAccepted,
    }: SetTermsAndPolicyRequest): Promise<AuthSessionUserResponse> {
        const user = await this.getUserById({ userId });
        await user.$query().patchAndFetch({ is_terms_policy_accepted: setTermsPolicyAccepted });
        return this.sessionService.getUserBySessionToken({ userId, sessionToken });
    }

    async setFcmToken(dto: SetFcmTokenRequest): Promise<ApiSuccessResponse> {
        return this.sessionService.setFcmToken(dto);
    }

    async signOut(dto: AuthSessionUserRequest): Promise<ApiSuccessResponse> {
        return this.sessionService.deleteUserSession(dto);
    }

    async resendVerificationCode({ userId, otpType }: ResendOtpCodeRequest): Promise<OtpCodeResponse> {
        const user = await this.getUserById({ userId });

        if (user.is_email_verified && otpType === OtpType.CurrentEmail) {
            throw ServiceRpcException(ApiEC.EmailAlreadyVerified);
        }

        return await lastValueFrom(
            this.natsClient.send<OtpCodeResponse, OtpTypeRequest>(OtpEventType.ResendOtpCode, {
                otpType,
                user: user.toOtpUserInfoDTO(),
            })
        );
    }

    async verifyOtpCode(dto: VerificationCodeRequest): Promise<AuthSessionUserResponse> {
        const user = await this.getUserById(dto);

        if (user.is_email_verified && dto.otpType === OtpType.CurrentEmail) {
            return this.getUserBySessionToken(dto);
        }

        const {
            ok,
            user: otpUser,
            otpType,
        } = await lastValueFrom(
            this.natsClient.send<VerifyOtpCodeResponse, VerifyOtpCodeRequest>(OtpEventType.VerifyOtpCode, {
                otpType: dto.otpType,
                code: dto.code,
                user: user.toOtpUserInfoDTO(),
            })
        );

        if (!ok) {
            throw ServiceRpcException(ApiEC.OTPCodeExpired);
        }

        switch (otpType) {
            case OtpType.CurrentEmail:
                await user.$query().patch({ is_email_verified: otpUser.isEmailVerified });
                break;
            case OtpType.NewEmail:
                if (otpUser.email === user.temp_email) {
                    await user.$query().patch({
                        is_email_verified: otpUser.isEmailVerified,
                        email: otpUser.email,
                        temp_email: null,
                    });
                }
                break;
            case OtpType.LastPhone:
                await user.$query().patch({ is_phone_verified: otpUser.isPhoneVerified });
                break;
        }

        return this.getUserBySessionToken(dto);
    }

    async checkUserPassword({ userId, password }: CheckPasswordRequest): Promise<CheckPasswordResponse> {
        const user = await this.getUserById({ userId });
        return {
            isMatch:
                user.auth_type === AuthType.Email ||
                (user.auth_type === AuthType.Phone && (await this.credsService.checkCredentials(userId, password))),
        };
    }

    async changePassword({ userId, currentPassword, newPassword }: ChangePasswordRequest): Promise<ApiSuccessResponse> {
        const user = await this.getUserById({ userId });
        if (
            (user.auth_type !== AuthType.Email && user.auth_type !== AuthType.Phone) ||
            !(await this.credsService.checkCredentials(userId, currentPassword))
        ) {
            throw ServiceRpcException(ApiEC.PasswordNotMatch);
        }

        if (currentPassword === newPassword) {
            throw ServiceRpcException(ApiEC.NewPasswordEqualCurrent);
        }

        const ok = await this.credsService.setCredentialsForUser(userId, newPassword);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (user?.email) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.natsClient.emit<any, SendEmailRequest>(EmailEventType.SendEmail, {
                emailType: EmailType.PasswordChanged,
                to: user.email,
                locals: { fullName: user?.profile?.fullName || undefined },
            });
        }

        return { ok };
    }

    async changeEmail({ userId, currentEmail, newEmail }: ChangeEmailRequest): Promise<ApiSuccessResponse> {
        const user = await this.getUserById({ userId });

        if (user.email !== currentEmail || currentEmail === newEmail) {
            throw ServiceRpcException(ApiEC.EmailWrong);
        }

        const { exists } = await this.checkUserExists({ email: newEmail });
        if (exists) {
            throw ServiceRpcException(ApiEC.EmailAlreadyRegistered);
        }

        const { isSent: ok, timeout: timeout } = await this.resendVerificationCode({
            userId,
            otpType: OtpType.ChangeEmail,
        });

        if (!ok && !timeout) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        await user.$query().patch({ temp_email: newEmail });
        return { ok };
    }

    async resetPassword(dto: ResetPasswordRequest): Promise<OtpCodeResponse> {
        const user = dto?.email ? await this.getUser({ email: dto.email }) : await this.getUser({ phone: dto.phone });
        if (
            user.auth_type !== AuthType.Email &&
            user.auth_type !== AuthType.Signatory &&
            user.auth_type !== AuthType.Phone
        ) {
            throw ServiceRpcException(ApiEC.UserCredentialNotFound);
        }
        if (user.auth_type !== AuthType.Signatory && !(await this.credsService.checkCredentialsExists(user.id))) {
            throw ServiceRpcException(ApiEC.UserCredentialNotFound);
        }
        return this.resendVerificationCode({ userId: user.id, otpType: OtpType.ResetPassword });
    }

    async verifyResetPassword(dto: ResetPasswordOTPRequest): Promise<ResetPasswordOTPResponse> {
        const user = dto?.email ? await this.getUser({ email: dto.email }) : await this.getUser({ phone: dto.phone });
        if (!user) {
            throw ServiceRpcException(ApiEC.UserNotFoundByEmail);
        }

        const otpType = OtpType.ResetPassword;

        if (dto?.email && user?.email) {
            const { otpCodeValid } = await lastValueFrom(
                this.natsClient.send<IsOtpCodeValidResponse, ChannelCodeWithOtpTypeRequest>(
                    OtpEventType.IsOtpCodeValid,
                    {
                        channel: user.email,
                        code: dto.code,
                        otpType,
                    }
                )
            );

            if (!otpCodeValid) {
                throw ServiceRpcException(ApiEC.OTPCodeExpired);
            }

            if (user.auth_type === AuthType.Signatory) {
                await user.$query().patchAndFetch({ is_email_verified: true });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.natsClient.emit<any, ChannelOtpTypeForcedRequest>(OtpEventType.DisableOtpCode, {
                channel: user.email,
                otpType,
                force: true,
            });
        }
        if (dto?.phone && user?.phone?.length && user?.phone[0]) {
            const { otpCodeValid } = await lastValueFrom(
                this.natsClient.send<IsOtpCodeValidResponse, ChannelCodeWithOtpTypeRequest>(
                    OtpEventType.IsOtpCodeValid,
                    {
                        channel: user.phone[0],
                        code: dto.code,
                        otpType,
                    }
                )
            );

            if (!otpCodeValid) {
                throw ServiceRpcException(ApiEC.OTPCodeExpired);
            }

            if (user.auth_type === AuthType.Signatory) {
                await user.$query().patchAndFetch({ is_phone_verified: true });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.natsClient.emit<any, ChannelOtpTypeForcedRequest>(OtpEventType.DisableOtpCode, {
                channel: user.phone[0],
                otpType,
                force: true,
            });
        }

        const recoveryToken = await this.sessionService.jwtService.signAsync({
            id: user.id,
            phone: dto?.phone,
            email: user?.email,
            otpType: OtpType.ResetPassword,
        });

        await this.resetPasswordTokenModel
            .query()
            .insert({
                user_id: user.id,
                token: recoveryToken,
                expired_at: dayjs()
                    .add(authConstants().resetTokenTTL * 1000, 'milliseconds')
                    .toDate()
                    .toISOString()
                    .replace('T', ' ')
                    .substring(0, 19),
            })
            .onConflict()
            .merge();

        return { recoveryToken };
    }
    async recoverPassword({ recoveryToken, newPassword }: RecoverPasswordRequest): Promise<AuthSuccessResponse> {
        const resetToken = await this.resetPasswordTokenModel
            .query()
            .modify('active')
            .findOne({ token: recoveryToken });

        if (!resetToken) {
            throw ServiceRpcException(ApiEC.PasswordRecoveryTokenExpired);
        }

        const tokenData = await this.sessionService.jwtService.verifyAsync(recoveryToken);

        await resetToken.$query().patch({ status: StatusType.Disabled });

        if ((!tokenData?.email && !tokenData?.phone) || tokenData?.otpType !== OtpType.ResetPassword) {
            throw ServiceRpcException(ApiEC.WrongPasswordRecoveryToken);
        }

        const user = tokenData?.email
            ? await this.getUser({ email: tokenData.email })
            : tokenData?.phone
            ? await this.getUser({ phone: tokenData.phone })
            : null;

        if (!user) {
            throw ServiceRpcException(ApiEC.UserNotFound);
        } else if (user.id !== resetToken.user_id) {
            throw ServiceRpcException(ApiEC.WrongPasswordRecoveryToken);
        }

        await this.credsService.setCredentialsForUser(user.id, newPassword);

        if (user?.email) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.natsClient.emit<any, SendEmailRequest>(EmailEventType.SendEmail, {
                emailType: EmailType.PasswordChanged,
                to: user.email,
                locals: { fullName: user?.profile?.fullName || undefined, otpCode: newPassword },
            });
        }

        return this.sessionService.createUserSession(user);
    }
    async externalUserAuth(dto: ExternalUserInfo): Promise<AuthSessionUserResponse> {
        const internalUserExists = await this.userModel
            .query()
            .modify('active')
            .withGraphJoined('signatory')
            .findOne({ 'users.email': dto.userEmail });
        if (internalUserExists) {
            return { sessionUser: internalUserExists.toSessionUserInfoDTO() };
        }
        const existingUser = await this.userModel
            .query()
            .withGraphJoined('profile')
            .findOne({
                [User.externalUserIdKey(dto.authType)]: dto.userId,
            });

        if (existingUser && existingUser.isActive()) {
            return { sessionUser: existingUser.toSessionUserInfoDTO() };
        } else if (existingUser) {
            throw ServiceRpcException(ApiEC.AccountInactive);
        }

        const trx = await this.userModel.startTransaction();
        let user: User;
        try {
            user = await this.userModel.query(trx).insert({
                email: dto.internalEmail,
                is_terms_policy_accepted: true,
                phone: dto?.userPhone ? [...dto.userPhone] : undefined,
                is_email_verified: true,
                ext_user_email: dto.userEmail,
                ext_user_name: dto.displayName,
                ext_user_avatar: dto.avatar,
                auth_type: dto.authType,
                [User.externalUserIdKey(dto.authType)]: dto.userId,
            });

            await this.profileService.createUserProfile({ userId: user.id }, trx);

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        user = await this.getUserById({ userId: user.id });

        return { sessionUser: user.toSessionUserInfoDTO() };
    }

    async deleteUserAccount(dto: UserIdRequest): Promise<DeleteUserAccountResponse> {
        const user = await this.getUserById(dto);

        if (!user) {
            throw ServiceRpcException(ApiEC.UserNotFound);
        }

        const trx = await this.userModel.startTransaction();

        try {
            if (user?.profile) {
                await user.profile.$query(trx).patch({
                    location: null,
                    avatar: null,
                    latitude: 0,
                    longitude: 0,
                });
            }

            await user.$query(trx).patch({
                email: `${Date.now()}_deleted_${user.email}`,
                status: StatusType.Deleted,
            });

            user.auth_type === AuthType.Google
                ? await user.$query(trx).patch({
                      ext_user_google_id: null,
                  })
                : user.auth_type === AuthType.Facebook
                ? await user.$query(trx).patch({
                      ext_user_facebook_id: null,
                  })
                : user.auth_type === AuthType.Apple
                ? await user.$query(trx).patch({
                      ext_user_apple_id: null,
                  })
                : null;

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        await this.sessionService.deleteUserSession(dto);

        return { ok: true, isForceLogout: true, avatar: user?.profile?.avatar };
    }

    async signUpByInvitation({
        coords,
        dob,
        email,
        firstName,
        gender,
        lastName,
        nationalId,
        location,
        phone,
    }: SignUpByInvitationRequest): Promise<User> {
        if (!email && !phone) {
            throw ServiceRpcException(ApiEC.WrongInput);
        }
        if (email) {
            const emailExists = (await this.checkUserExists({ email })).exists;
            if (emailExists) {
                throw ServiceRpcException(ApiEC.EmailAlreadyRegistered);
            }
        }
        if (phone) {
            const phoneExists = (await this.checkUserExists({ phone })).exists;
            if (phoneExists) {
                throw ServiceRpcException(ApiEC.PhoneAlreadyRegistered);
            }
        }
        const trx = await this.userModel.startTransaction();
        let user: User | null;
        try {
            user = email
                ? await this.userModel.query(trx).insert({
                      auth_type: AuthType.Email,
                      email,
                      national_id: nationalId,
                  })
                : phone
                ? await this.userModel.query(trx).insert({
                      auth_type: AuthType.Phone,
                      phone: [phone],
                      national_id: nationalId,
                  })
                : email && phone
                ? await this.userModel.query(trx).insert({
                      auth_type: AuthType.Phone,
                      email,
                      phone: [phone],
                      national_id: nationalId,
                  })
                : null;

            if (!user) {
                throw ServiceRpcException(ApiEC.InternalServerError);
            }

            await trx.commit();

            await this.profileService.createUserProfile({ userId: user.id });

            await this.profileService.setUserPersonalInformation({
                userId: user.id,
                firstName,
                lastName,
                location,
                userName: `${firstName}${lastName}`,
                gender,
                dob,
                coords,
            });

            await this.sessionService.createUserSession(user);
        } catch (err) {
            await trx.rollback();
            throw err;
        }
        if (!user) {
            throw ServiceRpcException(ApiEC.InternalServerError);
        }

        return await user.$query().withGraphJoined('[profile, session]');
    }

    async signUpLocaInternal({ email, phone, name }: AuthSignUpRequestInternal): Promise<User> {
        if (!email && !phone) {
            throw new ApiException(ApiEC.WrongInput);
        }

        const trx = await this.userModel.startTransaction();
        let user: User | null | undefined;
        try {
            user = await this.userModel
                .query(trx)
                .modify('active')
                .findOne((cb: AnyQueryBuilder) => {
                    if (email) {
                        cb.where({ email }).orWhere({ ext_user_email: email });
                    } else if (phone) {
                        cb.where({ phone }).orWhere({ ext_user_phone: phone });
                    }
                });

            if (!user) {
                let insertQuery: Objection.PartialModelObject<User> = {};

                if (email && !phone) {
                    insertQuery = {
                        email,
                    };
                } else if (phone && !email) {
                    insertQuery = {
                        phone: [phone],
                    };
                } else if (email && phone) {
                    insertQuery = {
                        email,
                        phone: [phone],
                    };
                }

                user = await this.userModel
                    .query(trx)
                    .insertAndFetch({ ...insertQuery, auth_type: AuthType.Signatory });

                if (!user) {
                    throw ServiceRpcException(ApiEC.InternalServerError);
                }
            }

            await this.profileService.createUserProfile({ userId: user.id, name }, trx);

            await trx.commit();
        } catch (err) {
            await trx.rollback();
            throw err;
        }

        return user;
    }
}
