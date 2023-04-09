import { join, resolve } from 'path';
import { writeFileSync } from 'fs';
import { Response } from 'express';
import bodyParser from 'body-parser';
import basicAuth from 'express-basic-auth';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ApiModulesList } from './api/api.modules.list';
import { GlobalExceptionFilter } from '@signy/exceptions';
import { swaggerConfig } from './swagger';
// eslint-disable-next-line @typescript-eslint/no-var-requires

let logger: Logger;
const gateway = async () => {
    logger = new Logger(gateway.name);

    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = new ConfigService();
    const port = parseInt(configService.get('API_PORT', '3000'), 10);
    const apiRoutePrefix = configService.get('API_ROUTE_PREFIX', 'api');
    const apiDoc = configService.get('SWAGGER_DOC_URL', 'api-docs');
    const isSwaggerOn = configService.get('IS_SWAGGER_UI_ACTIVE', 'false').toLowerCase() === 'true';

    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: (errors) => errors,
            transform: true,
            whitelist: true,
            forbidUnknownValues: false,
        })
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.enable('trust proxy');
    app.disable('etag'); // Prevent code: 304 - Not Modified on IOS devices

    app.useStaticAssets(join(__dirname, 'assets', 'public'));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawBodyBuffer = (req: any, res: Response, buf: Buffer, encoding: BufferEncoding) => {
        if (buf && buf.length) {
            req.rawBody = buf.toString(encoding || 'utf8');
        }
    };

    app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
    app.use(bodyParser.json({ verify: rawBodyBuffer }));
    app.enableCors({ origin: '*', credentials: false });

    if (isSwaggerOn) {
        if (configService.get('NODE_ENV', '') !== 'development') {
            app.use(
                [`/${apiDoc}`, `/${apiDoc}-json`],
                basicAuth({
                    challenge: true,
                    users: {
                        [configService.get('BASIC_AUTH_USER_NAME', 'admin')]: configService.get(
                            'BASIC_AUTH_PASSWORD',
                            'Messapps@1'
                        ),
                    },
                })
            );
        }
        const apiGuideLink = configService.get('API_GUIDE_LINK', '');
        const appName = configService.get('APPNAME', 'Project name');
        const document = SwaggerModule.createDocument(app, swaggerConfig({ appName, port, apiGuideLink }), {
            include: ApiModulesList,
        });

        // Export swagger doc in JSON format
        const swaggerDoc = resolve('./apps/gateway/src/swagger') + '/swagger.doc.json';
        writeFileSync(swaggerDoc, JSON.stringify(document, null, 2));
        logger.debug(`Swagger doc in ${swaggerDoc}`);

        SwaggerModule.setup(apiDoc, app, document);
    }

    const natsToken = configService.get('NATS_TOKEN');
    const natsHost = configService.get('NATS_HOST', 'localhost');
    const natsPort = configService.get('NATS_PORT', '4222');

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
            servers: [`nats://${natsHost}:${natsPort}`],
            token: natsToken,
        },
    });

    await app.startAllMicroservices();

    await app.listen(port);

    logger.debug(`${gateway.name.toUpperCase()} API Server started at http://localhost:${port}/${apiRoutePrefix}`);
    isSwaggerOn
        ? logger.debug(`Swagger Docs runs at http://localhost${port ? ':' + port : ''}/${apiDoc} `)
        : logger.debug('Swagger Docs is OFF');
};

gateway().catch((error) => {
    logger.error(error);
});
