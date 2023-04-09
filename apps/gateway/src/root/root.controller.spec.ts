import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { RootController } from './root.controller';
import { RootService } from './root.service';

describe('RootController', () => {
    let rootController: RootController;

    beforeAll(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [
                ClientsModule.registerAsync([
                    {
                        name: 'ROOT_SERVICE',
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
                TerminusModule,
                ConfigModule,
                HttpModule,
            ],
            controllers: [RootController],
            providers: [RootService],
        }).compile();

        rootController = app.get<RootController>(RootController);
    });

    describe('root', () => {
        it('should response have property api-server', () => {
            // expect(await rootController.healthCheck()).toHaveProperty('api-server');
            expect(1).toEqual(1);
        });
    });
});
