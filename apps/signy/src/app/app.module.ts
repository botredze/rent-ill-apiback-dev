import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContactModule } from '../contact/contact.module';
import { DocumentInputModule } from '../document-input/document-input.module';
import { DocumentModule } from '../document/document.module';
import { ShareModule } from '../share/share.module';
import { SignatoryModule } from '../signatory/signatory.module';
import { SignyEmailModule } from '../signy-email/signy.email.module';
import { SignyModule } from '../signy/signy.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
        }),
        SignyModule,
        ContactModule,
        DocumentInputModule,
        DocumentModule,
        SignatoryModule,
        SignyEmailModule,
        ShareModule,
    ],
})
export class AppModule {}
