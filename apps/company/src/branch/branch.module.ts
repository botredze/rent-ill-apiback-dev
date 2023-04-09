import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DbModule } from '@signy/db';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AddressModule } from '../address/address.module';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { CompanyModule } from '../company/company.module';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'BRANCH_SERVICE',
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
        forwardRef(() => CompanyModule),
        AddressModule,
    ],
    controllers: [BranchController],
    providers: [BranchService],
    exports: [BranchService],
})
export class BranchModule {}
