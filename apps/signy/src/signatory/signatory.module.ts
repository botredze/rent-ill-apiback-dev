import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaginationModule } from '@signy/pagination';
import { ContactModule } from '../contact/contact.module';
import { DocumentModule } from '../document/document.module';
import { SignatoryController } from './signatory.controller';
import { SignatoryService } from './signatory.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'SIGNATORY_SERVICE',
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
        DocumentModule,
        ContactModule,
        PaginationModule,
    ],
    controllers: [SignatoryController],
    providers: [SignatoryService],
    exports: [SignatoryService],
})
export class SignatoryModule {}
