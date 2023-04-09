import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DocumentModule } from '../document/document.module';
import { SignatoryModule } from '../signatory/signatory.module';
import { DocumentInputController } from './document-input.controller';
import { DocumentInputService } from './document-input.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'DOCUMENT_INPUT_SERVICE',
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
        SignatoryModule,
    ],
    controllers: [DocumentInputController],
    providers: [DocumentInputService],
})
export class DocumentInputModule {}
