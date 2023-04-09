import { RpcException } from '@nestjs/microservices';
import { ApiEC } from './enums';

export function ServiceRpcException(errorCode: ApiEC, message?: string): RpcException {
    return new RpcException({
        errorCode,
        message,
    });
}
