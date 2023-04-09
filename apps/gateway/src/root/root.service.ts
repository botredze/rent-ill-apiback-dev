import { join } from 'path';
import { renderFile } from 'pug';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppStoreRedirectRequest } from './dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RootService {
    private logger: Logger;
    private sendbirdApiToken: string;

    constructor(@Inject('ROOT_SERVICE') private natsClient: ClientProxy, private configService: ConfigService) {
        this.logger = new Logger(RootService.name);
        this.sendbirdApiToken = this.configService.get('SENDBIRD_API_TOKEN', '');
    }
    async appStoreRedirect(dto: AppStoreRedirectRequest): Promise<string> {
        // http://localhost:3000/app-store?pageType=newsFeed&id=1
        const redirectPage = renderFile(join(__dirname, 'assets', 'templates/web/app_store.pug'), {
            ...dto,
            appName: this.configService.get('APPNAME', 'App Name'),
            appleStoreUrl: this.configService.get('APP_ITUNES_URL', ''),
            googlePlayUrl: this.configService.get('GOOGLE_PLAY_URL', ''),
            webSite: this.configService.get('WEB_URL', '//'),
        });

        return redirectPage;
    }
}
