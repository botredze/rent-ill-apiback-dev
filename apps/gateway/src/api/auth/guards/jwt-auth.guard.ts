import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { commonConstants, RolesType } from '@signy/common';
import { AuthType } from '@signy/auth';
import { ApiEC, ApiException } from '@signy/exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private userRoles?: string[];
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        this.userRoles = this.reflector.get<string[]>('roles', context.getHandler());
        return super.canActivate(context);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleRequest(err: any, user: any, info: any) {
        if (err) {
            throw new ApiException(ApiEC.AccessDenied);
        }

        if (!user) {
            if (this.userRoles && this.userRoles.includes(RolesType.Guest)) {
                return {
                    id: 0,
                    authType: AuthType.Guest,
                    firstName: commonConstants.defaultUserName,
                    is_email_verified: true,
                    role: RolesType.Guest,
                    isFullAccess: false,
                };
            }
            throw new ApiException(ApiEC.AccessDenied);
        }

        return user;
    }
}
