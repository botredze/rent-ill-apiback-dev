import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ApiException } from '@signy/exceptions';
import { isEmail, validateOrReject } from 'class-validator';
import { lastValueFrom } from 'rxjs';
import { AuthSignInRequest } from '@signy/auth';
import { ApiEC } from '@signy/exceptions';

@Injectable()
export class LocalStrategyEmail extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async validate(username: string, password: string): Promise<any> {
        const authRequest = new AuthSignInRequest();
        authRequest.email = username;
        authRequest.password = password;
        await validateOrReject(authRequest);

        const { sessionUser } = await lastValueFrom(
            isEmail(username)
                ? this.authService.getUserByCredentials({ email: username, password })
                : this.authService.getUserByCredentials({ phone: username, password })
        );

        if (!sessionUser) {
            throw new ApiException(ApiEC.AccessDenied);
        }
        return sessionUser;
    }
}
