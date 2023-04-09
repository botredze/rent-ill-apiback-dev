import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddressModule } from '../address/address.module';
import { BranchModule } from '../branch/branch.module';
import { CompanyModule } from '../company/company.module';
import { RoleModule } from '../role/role.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
        }),
        CompanyModule,
        AddressModule,
        BranchModule,
        RoleModule,
    ],
})
export class AppModule {}
