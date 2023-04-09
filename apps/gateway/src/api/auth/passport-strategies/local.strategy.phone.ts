// import { Strategy } from 'passport-local';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { AuthService } from '../auth.service';
// import { ApiException } from '@signy/exceptions';
// import { validateOrReject } from 'class-validator';
// import { lastValueFrom } from 'rxjs';
// import { AuthSignInRequest } from '@signy/auth';
// import { ApiEC } from '@signy/exceptions';

// @Injectable()
// export class LocalStrategyPhone extends PassportStrategy(Strategy) {
//     constructor(private authService: AuthService) {
//         super({
//             usernameField: 'phone',
//             passwordField: 'password',
//         });
//     }

//     async validate(username: string, password: string): Promise<any> {
//         const authRequest = new AuthSignInRequest();
//         authRequest.phone = username;
//         authRequest.password = password;
//         await validateOrReject(authRequest);

//         const { sessionUser } = await lastValueFrom(
//             this.authService.getUserByCredentials({ phone: username, password })
//         );

//         if (!sessionUser) {
//             throw new ApiException(ApiEC.AccessDenied);
//         }
//         return sessionUser;
//     }
// }
