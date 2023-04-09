import { Module } from '@nestjs/common';
import { DbModule } from '@signy/db';
import { CredsService } from './creds.service';

@Module({
    imports: [DbModule],
    providers: [CredsService],
    exports: [CredsService],
})
export class CredsModule {}
