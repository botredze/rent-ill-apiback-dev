import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LegalDocs } from './dto';

@Injectable()
@Module({
    imports: [ConfigModule],
})
export class ContentService {
    constructor(private configService: ConfigService) {}
    async getLegalDocs(): Promise<LegalDocs> {
        const baseURL = `${this.configService.get('API_DOMAIN')}`;
        return {
            termsAndConditions: `${baseURL}/terms-and-conditions/index.html`,
            privacyPolicy: `${baseURL}/privacy-policy/index.html`,
        };
    }
}
