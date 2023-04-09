import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SmsModule } from '@signy/sms';
import { SignyEmailController } from './signy.email.controller';
import { SignyEmailService } from './signy.email.service';
@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'SIGNY_EMAIL_SERVICE',
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
        SmsModule,
    ],
    controllers: [SignyEmailController],
    providers: [SignyEmailService],
})
export class SignyEmailModule {}
