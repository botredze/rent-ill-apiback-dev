/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isString } from 'lodash';
import { Request } from 'express';
import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validateOrReject } from 'class-validator';
import { lastValueFrom } from 'rxjs';
import { Strategy } from 'passport-strategy';
import { authConstants } from '../auth.constants';
import { ApiException } from '@signy/exceptions';
import { AuthService } from '../auth.service';
import { ExternalUserInfo } from '@signy/auth';
import { AuthType } from '@signy/auth';
import { ApiEC } from '@signy/exceptions';

class GoogleAuthStrategyOptions {
    accessTokenField: string;
}

type GoogleAuthVerifyFunction = (googleUserData: any, done: (error: any, user?: any, info?: any) => void) => void;

class GoogleAuthStrategy extends Strategy {
    options: GoogleAuthStrategyOptions;
    verify: GoogleAuthVerifyFunction;

    constructor(options: GoogleAuthStrategyOptions, verify: GoogleAuthVerifyFunction) {
        super();
        this.options = options;
        this.verify = verify;
    }

    authenticate(req: Request, options?: any): any {
        const userToken = req.body?.[this.options.accessTokenField];
        if (!isString(userToken) || !userToken.length) {
            return this.fail(403);
        }

        this.googleAuth(userToken)
            .then((googleUserData) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.verify(googleUserData, (error: any, user?: any, info?: any) => {
                    if (error || !user) {
                        this.fail(403);
                    } else {
                        this.success(user, info);
                    }
                });
            })
            .catch(() => {
                this.fail(403);
            });
    }

    private async googleAuth(userToken: string): Promise<object> {
        const people = google.people({
            version: 'v1',
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });

        const { data } = await people.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,names,photos,phoneNumbers',
        });

        return data;
    }
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleAuthStrategy, 'google-auth') {
    constructor(private authService: AuthService) {
        super({
            accessTokenField: 'accessToken',
        });
    }

    async validate(googleUserData: any) {
        const externalUserInfo = new ExternalUserInfo();
        externalUserInfo.authType = AuthType.Google;

        const { names, emailAddresses, photos, phoneNumbers } = googleUserData;
        if (names && names.length) {
            const { metadata, familyName, givenName } = names[0];
            if (metadata && metadata.source && metadata.source.id) {
                externalUserInfo.userId = metadata.source.id;
            }
            externalUserInfo.displayName = [familyName, givenName]
                .filter((x) => isString(x))
                .filter((x) => x.length)
                .join(' ');
        }

        if (photos !== undefined) {
            for (const { metadata, url } of photos) {
                if (metadata.primary && url) {
                    externalUserInfo.avatar = url;
                    if (!externalUserInfo.userId && metadata.source && metadata.source.id) {
                        externalUserInfo.userId = metadata.source.id;
                    }
                    break;
                }
            }
        }

        if (phoneNumbers !== undefined) {
            for (const { metadata, value } of phoneNumbers) {
                if (metadata?.primary && value) {
                    externalUserInfo.userPhone = value;
                    if (!externalUserInfo.userId && metadata.source && metadata.source.id) {
                        externalUserInfo.userId = metadata.source.id;
                    }
                    break;
                }
            }
        }

        if (emailAddresses !== undefined) {
            for (const { metadata, value } of emailAddresses) {
                if (metadata.primary && value) {
                    externalUserInfo.userEmail = value;
                    if (!externalUserInfo.userId && metadata.source && metadata.source.id) {
                        externalUserInfo.userId = metadata.source.id;
                    }
                    break;
                }
            }
        }

        externalUserInfo.internalEmail = `google${externalUserInfo.userId}@${authConstants().defaultEmailDomain}.com`;

        await validateOrReject(externalUserInfo);

        const { sessionUser } = await lastValueFrom(this.authService.externalUserAuth(externalUserInfo));

        if (!sessionUser) {
            throw new ApiException(ApiEC.AccessDenied);
        }

        return sessionUser;
    }
}
