import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { DbModule } from '@signy/db';
import { SlackModule } from '@signy/slack';
import { SmsModule } from '@signy/sms';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'OTP_SERVICE',
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
        DbModule,
        SlackModule,
        SmsModule,
    ],
    controllers: [OtpController],
    providers: [OtpService],
})
export class OtpModule {}
