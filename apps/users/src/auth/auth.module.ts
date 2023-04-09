import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DbModule } from '@signy/db';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionModule } from '../sessions/session.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CredsModule } from '../creds/creds.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'AUTH_SERVICE',
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
        CredsModule,
        SessionModule,
        ProfileModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
