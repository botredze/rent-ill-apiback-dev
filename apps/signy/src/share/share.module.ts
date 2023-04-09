import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from '@signy/redis';
import { S3Module } from '@signy/s3';
import { SmsModule } from '@signy/sms';
import { QueueProcessesModule } from '../utils/queue';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: `${configService.get<string>('JWT_MAX_AGE_SEC')}s` },
            }),
        }),
        ClientsModule.registerAsync([
            {
                name: 'SHARE_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.NATS,
                    options: {
                        servers: [
                            `nats://${configService.get('NATS_HOST', 'localhost')}:${configService.get(
                                'NATS_PORT',
                                '4222'
                            )}`,
                        ],
                        token: configService.get('NATS_TOKEN'),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
        RedisModule,
        ConfigModule,
        S3Module,
        SmsModule,
        forwardRef(() => QueueProcessesModule),
    ],
    controllers: [ShareController],
    providers: [ShareService],
    exports: [ShareService],
})
export class ShareModule {}
