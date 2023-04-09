import { Controller, Get, Query } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { RootService } from './root.service';

@Controller()
export class RootController {
    constructor(
        private readonly rootService: RootService,
        private health: HealthCheckService,
        private http: HttpHealthIndicator
    ) {}

    @Get('health-check')
    @HealthCheck()
    healthCheck(): Promise<HealthCheckResult> {
        return this.health.check([() => this.http.pingCheck('api-server', process.env.API_DOMAIN || '//')]);
    }

    @Get('app-store')
    async appStore(@Query('pageType') pageType: string, @Query('id') id: number): Promise<string> {
        return await this.rootService.appStoreRedirect({ pageType, id });
    }
}
