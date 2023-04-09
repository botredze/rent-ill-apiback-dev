import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DbModule } from '@signy/db';
import { DriveModule } from '@signy/drive';
import { ESignModule } from '@signy/e-sign';
import { PaginationModule } from '@signy/pagination';
import { S3Module } from '@signy/s3';
import { SignyController } from './signy.controller';
import { SignyService } from './signy.service';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'SIGNY_SERVICE',
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
        ESignModule,
        S3Module,
        DriveModule,
    ],
    controllers: [SignyController],
    providers: [SignyService],
})
export class SignyModule {}
