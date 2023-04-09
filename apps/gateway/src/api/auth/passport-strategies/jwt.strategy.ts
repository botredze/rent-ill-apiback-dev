import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ApiException } from '@signy/exceptions';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';
import { JWTPayload, SessionUserInfo } from '@signy/auth';
import { ApiEC } from '@signy/exceptions';

const headerSessionKey = 'x-session-key';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService, private configService: ConfigService) {
        super({
            passReqToCallback: true,
            jwtFromRequest: ExtractJwt.fromHeader(headerSessionKey),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(_: Request, dto: JWTPayload): Promise<SessionUserInfo> {
        if (!dto || !dto?.id || !dto?.sessionToken) {
            throw new ApiException(ApiEC.AccessDenied);
        }

        const { sessionUser } = await lastValueFrom(this.authService.getUserBySessionToken(dto));

        if (!sessionUser) {
            throw new ApiException(ApiEC.AccessDenied);
        }

        return sessionUser;
    }
}
