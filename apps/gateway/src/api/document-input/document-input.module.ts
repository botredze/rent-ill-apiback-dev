import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Module } from '@signy/s3';
import { DocumentInputService } from './document-input.service';
import { DocumentInputController } from './document-input.controller';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                name: 'GATEWAY_DOCUMENT_INPUT_PUBLISHER',
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
    controllers: [DocumentInputController],
    providers: [DocumentInputService],
})
export class DocumentInputModule {}
