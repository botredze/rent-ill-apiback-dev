import { Module } from '@nestjs/common';
import { IapService } from './iap.service';

@Module({
    providers: [IapService],
    exports: [IapService],
})
export class IapModule {}
