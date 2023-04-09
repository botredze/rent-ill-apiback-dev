import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ESignService } from './e-sign.service';

@Module({
    imports: [ConfigModule],
    providers: [ESignService],
    exports: [ESignService],
})
export class ESignModule {}
