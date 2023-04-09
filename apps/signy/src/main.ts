import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

let logger: Logger;
const signy = async () => {
    logger = new Logger(signy.name);

    const configService = new ConfigService();

    const natsToken = configService.get('NATS_TOKEN');
    const natsHost = configService.get('NATS_HOST', 'localhost');
    const natsPort = configService.get('NATS_PORT', '4222');

    const app = await NestFactory.createMicroservice(AppModule, {
        transport: Transport.NATS,
        options: {
            servers: [`nats://${natsHost}:${natsPort}`],
            token: natsToken,
        },
    });

    await app.listen();

    logger.debug(`${signy.name.toUpperCase()} Is started and listening`);
};
signy();
