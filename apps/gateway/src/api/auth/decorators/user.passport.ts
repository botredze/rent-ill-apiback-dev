import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthType } from '@signy/auth';
import { ApiEC } from '@signy/exceptions';
import { ApiException } from '@signy/exceptions';

export const UserPassport = createParamDecorator(
    (data: { allowUnverifiedEmail?: boolean; allowUnverifiedPhone?: boolean }, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        if (request?.user) {
            // instanceof User
            if (
                request.user.isEmailVerified ||
                request.user.isPhoneVerified ||
                data?.allowUnverifiedEmail == true ||
                data?.allowUnverifiedPhone == true
            ) {
                return request.user;
            } else if (request.user.authType === AuthType.Email) {
                throw new ApiException(ApiEC.UserEmailIsNotVerified);
            } else if (request.user.authType === AuthType.Phone) {
                throw new ApiException(ApiEC.UserPhoneIsNotVerified);
            }
        } else {
            throw new ApiException(ApiEC.AccessDenied);
        }
    }
);
