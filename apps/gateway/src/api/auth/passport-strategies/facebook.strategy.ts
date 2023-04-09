import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import { PassportStrategy } from '@nestjs/passport';
import PassportFacebookToken from 'passport-facebook-token';
import { AuthService } from '../auth.service';
import { ApiException } from '@signy/exceptions';
import { authConstants } from '../auth.constants';
import { lastValueFrom } from 'rxjs';
import { ExternalUserInfo } from '@signy/auth';
import { AuthType } from '@signy/auth';
import { ApiEC } from '@signy/exceptions';

@Injectable()
export class FacebookStrategy extends PassportStrategy(PassportFacebookToken, 'facebook-auth') {
    constructor(private authService: AuthService, private configService: ConfigService) {
        super({
            clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
            clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
            accessTokenField: 'accessToken',
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: PassportFacebookToken.Profile) {
        if (!profile || !profile.id) {
            throw new ApiException(ApiEC.InternalServerError);
        }

        const externalUserInfo = new ExternalUserInfo();
        externalUserInfo.authType = AuthType.Facebook;
        externalUserInfo.userId = profile.id;
        externalUserInfo.internalEmail = `fb${profile.id}@${authConstants().defaultEmailDomain}.com`;
        externalUserInfo.userEmail =
            profile.emails.length && profile.emails[0] && profile.emails[0].value.length
                ? profile.emails[0].value
                : undefined;
        externalUserInfo.displayName = profile.displayName ?? undefined;
        externalUserInfo.avatar =
            profile.photos && profile.photos.length && profile?.photos[0]?.value ? profile.photos[0].value : undefined;

        await validateOrReject(externalUserInfo);

        const { sessionUser } = await lastValueFrom(this.authService.externalUserAuth(externalUserInfo));

        if (!sessionUser) {
            throw new ApiException(ApiEC.AccessDenied);
        }

        return sessionUser;
    }
}
