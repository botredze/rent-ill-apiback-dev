import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DbModule } from '@signy/db';
import { PaginationModule } from '@signy/pagination';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'E-SIGN_SERVICE',
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
        PaginationModule,
        DbModule,
    ],
    controllers: [ContactController],
    providers: [ContactService],
    exports: [ContactService],
})
export class ContactModule {}
