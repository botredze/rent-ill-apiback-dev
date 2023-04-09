/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isString, isObject } from 'lodash';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';
import jwksClient from 'jwks-rsa';
import { decode, verify, Secret } from 'jsonwebtoken';
import { Strategy } from 'passport-strategy';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { validateOrReject } from 'class-validator';
import { authConstants } from '../auth.constants';
import { ApiException } from '@signy/exceptions';
import { AuthService } from '../auth.service';
import { ExternalUserInfo } from '@signy/auth';
import { AuthType } from '@signy/auth';
import { ApiEC } from '@signy/exceptions';

const jwks = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
    cache: true,
    cacheMaxEntries: 10,
    cacheMaxAge: 86400 * 1000,
});

class AppleAuthStrategyOptions {
    appleAllowedBundleIds: [string];
}

type AppleAuthVerifyFunctionWithReq = (
    req: Request,
    appleUserProfile: AppleUserProfile,
    done: (error: any, user?: any, info?: any) => void
) => void;

interface AppleAuthTokenPayload {
    aud?: string;
    iss?: string;
    sub?: string;
    email?: string;
}

interface AppleUserProfile {
    userId: string;
    userEmail?: string;
    displayName?: string;
}

class AppleAuthStrategy extends Strategy {
    constructor(private options: AppleAuthStrategyOptions, private verify: AppleAuthVerifyFunctionWithReq) {
        super();
    }

    authenticate(req: Request, options?: any): any {
        const { identityToken, appleUserId } = req.body;
        if (!isString(identityToken) || !isString(appleUserId)) {
            return this.fail(403);
        }

        this.verifyAppleIdentityToken(identityToken, appleUserId)
            .then((appleAuthPayload) => {
                const profile: AppleUserProfile = {
                    userId: appleUserId,
                    userEmail: appleAuthPayload.email,
                    displayName: [req.body.firstName, req.body.lastName]
                        .filter((x) => isString(x) && x.length)
                        .join(' '),
                };
                this.verify(req, profile, (error: any, user?: any, info?: any) => {
                    if (error || !user) {
                        this.fail(403);
                    } else {
                        this.success(user, info);
                    }
                });
            })
            .catch((error) => {
                this.fail(403);
            });
    }

    private async getSigningKey(kid: string): Promise<Secret> {
        return new Promise((resolve, reject) => {
            jwks.getSigningKey(kid, (err: any, key: any) => {
                if (key) {
                    const signingKey = key.getPublicKey();
                    resolve(signingKey);
                } else {
                    reject(err);
                }
            });
        });
    }

    private async verifyAppleIdentityToken(identityToken: string, appleUserId: string): Promise<AppleAuthTokenPayload> {
        if (!identityToken || !appleUserId) {
            throw { message: 'identityToken or appleUserId is not set ' };
        }

        const untrustedData: Record<string, any> = decode(identityToken, { complete: true }) ?? {};
        if (!untrustedData || !untrustedData['header']) {
            throw { message: 'identityToken or appleUserId is not set ' };
        }

        const kid = untrustedData['header'].kid;
        const alg = untrustedData['header'].alg;

        const signingKey = await this.getSigningKey(kid);

        const payload = verify(identityToken, signingKey, {
            algorithms: [alg],
        }) as AppleAuthTokenPayload;

        if (!isObject(payload)) {
            throw { message: 'apple decoded data is not an object' };
        }

        const appleSignInBundleIDs = process.env.APPLE_SIGN_IN_BUNDLE_IDS || '';

        if (!appleSignInBundleIDs.split(',').includes(payload.aud ?? '')) {
            throw { message: 'apple identityToken contains wrong value for aud parameter' };
        } else if ((<any>payload).iss !== 'https://appleid.apple.com') {
            throw { message: 'apple identityToken contains wrong value for iss parameter' };
        } else if ((<any>payload).sub !== appleUserId) {
            throw {
                message: `apple identityToken contains wrong value for sub parameter (appleUserId = ${appleUserId})`,
            };
        }

        return payload;
    }
}

@Injectable()
export class AppleStrategy extends PassportStrategy(AppleAuthStrategy, 'apple-auth') {
    constructor(private authService: AuthService, private configService: ConfigService) {
        super({
            appleAllowedBundleIds: configService.get<string>('APPLE_SIGN_IN_BUNDLE_IDS')?.split(',') ?? [],
        });
    }

    async validate(req: Request, appleUserProfile: AppleUserProfile) {
        const externalUserInfo = new ExternalUserInfo();
        externalUserInfo.authType = AuthType.Apple;
        externalUserInfo.userId = appleUserProfile.userId;
        externalUserInfo.userEmail = appleUserProfile.userEmail;
        externalUserInfo.displayName = appleUserProfile.displayName;
        externalUserInfo.internalEmail = `apple${externalUserInfo.userId}@${authConstants().defaultEmailDomain}.com`;

        await validateOrReject(externalUserInfo);

        const { sessionUser } = await lastValueFrom(this.authService.externalUserAuth(externalUserInfo));

        if (!sessionUser) {
            throw new ApiException(ApiEC.AccessDenied);
        }

        return sessionUser;
    }
}
