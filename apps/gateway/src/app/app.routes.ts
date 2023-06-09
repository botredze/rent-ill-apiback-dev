import { ConfigService } from '@nestjs/config';
import { Routes } from 'nest-router';
import { ApiModulesList } from '../api/api.modules.list';
import { RootModule } from '../root/root.module';
export const routes = (): Routes => {
    const configService = new ConfigService();
    const apiRoutePrefix = configService.get('API_ROUTE_PREFIX', 'api');
    return [
        {
            path: '',
            module: RootModule,
            children: ApiModulesList.map((module) => ({ path: apiRoutePrefix, module })),
        },
    ];
};
