import { ObjectionModule } from '@willsoto/nestjs-objection';
import { Module } from '@nestjs/common';
import * as models from '../models';
import config from '../../knexfile';
@Module({
    imports: [ObjectionModule.register({ config }), ObjectionModule.forFeature(Object.values(models))],
    exports: [ObjectionModule],
})
export class DbModule {}
