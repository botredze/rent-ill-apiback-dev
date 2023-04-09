import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DbModule } from '@signy/db';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { AddressModule } from '../address/address.module';
import { BranchModule } from '../branch/branch.module';
import { RoleModule } from '../role/role.module';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'COMPANY_SERVICE',
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
        AddressModule,
        forwardRef(() => BranchModule),
        forwardRef(() => RoleModule),
    ],
    controllers: [CompanyController],
    providers: [CompanyService],
    exports: [CompanyService],
})
export class CompanyModule {}
