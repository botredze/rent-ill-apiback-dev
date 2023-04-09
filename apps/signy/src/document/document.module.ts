import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DriveModule } from '@signy/drive';
import { PaginationModule } from '@signy/pagination';
import { S3Module } from '@signy/s3';
import { ShareModule } from '../share/share.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'DOCUMENT_SERVICE',
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
        DriveModule,
        S3Module,
        PaginationModule,
        ShareModule,
    ],
    controllers: [DocumentController],
    providers: [DocumentService],
    exports: [DocumentService],
})
export class DocumentModule {}
