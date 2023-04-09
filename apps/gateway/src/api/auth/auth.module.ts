import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    JwtStrategy,
    LocalStrategyEmail,
    // LocalStrategyPhone,
    GoogleStrategy,
    FacebookStrategy,
    AppleStrategy,
    // GoogleContactsStrategy,
} from './passport-strategies';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                name: 'GATEWAY_AUTH_PUBLISHER',
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
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        LocalStrategyEmail,
        // GoogleContactsStrategy,
        // LocalStrategyPhone,
        GoogleStrategy,
        FacebookStrategy,
        AppleStrategy,
    ],
    exports: [AuthService],
})
export class AuthModule {}
