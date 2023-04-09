import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SignyShareController } from './signy.share.controller';
import { SignyShareService } from './signy.share.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                name: 'GATEWAY_SIGNY_SHARE_PUBLISHER',
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
    ],
    controllers: [SignyShareController],
    providers: [SignyShareService],
})
export class SignyShareModule {}
