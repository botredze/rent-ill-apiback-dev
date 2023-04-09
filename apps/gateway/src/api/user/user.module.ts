import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { S3Module } from '@signy/s3';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                name: 'GATEWAY_USER_PUBLISHER',
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.NATS,
                    options: {
                        servers: [
                            `nats://${configService.get<string>('NATS_HOST', 'localhost')}:${configService.get<string>(
                                'NATS_PORT',
                                '4222'
                            )}`,
                        ],
                        token: configService.get<string>('NATS_TOKEN'),
                    },
                }),
            },
        ]),
        S3Module,
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
