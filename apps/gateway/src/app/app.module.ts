import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RouterModule } from 'nest-router';
import { ApiMiddleware } from '../middlewares';
import { routes } from './app.routes';
import { RootModule } from '../root/root.module';
import { ApiModulesList } from '../api/api.modules.list';
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
        RouterModule.forRoutes(routes()),
        RootModule,
        ...ApiModulesList,
    ],
})
export class AppModule implements NestModule {
    constructor(private configService: ConfigService) {}
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ApiMiddleware).forRoutes(`/${this.configService.get('API_ROUTE_PREFIX', 'api')}/*`);
    }
}
