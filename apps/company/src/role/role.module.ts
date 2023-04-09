import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DbModule } from '@signy/db';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CompanyModule } from '../company/company.module';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'ROLE_SERVICE',
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
    ],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule {}
