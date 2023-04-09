import { Module } from '@nestjs/common';
import { DriveService } from './drive.service';

@Module({
    imports: [],
    providers: [DriveService],
    exports: [DriveService],
})
export class DriveModule {}
