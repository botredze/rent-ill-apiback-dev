import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from '@signy/redis';
import { SmsModule } from '@signy/sms';
import { ShareModule } from '../../share/share.module';
import { QueueProcessesService } from './queue.processes.service';
@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'QUEUE_PROCESSES_SERVICE',
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
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: `${configService.get<string>('JWT_MAX_AGE_SEC')}s` },
            }),
        }),
        RedisModule,
        SmsModule,
        forwardRef(() => ShareModule),
    ],
    providers: [QueueProcessesService],
    exports: [QueueProcessesService],
})
export class QueueProcessesModule {}
