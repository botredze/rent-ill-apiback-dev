import { Type } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { CompanyModule } from './company/company.module';
import { ContactModule } from './contact/contact.module';
import { ContentModule } from './content/content.module';
import { DocumentInputModule } from './document-input/document-input.module';
import { DocumentModule } from './document/document.module';
import { ProfileModule } from './profile/profile.module';
import { RoleModule } from './role/role.module';
import { SignatoryModule } from './signatory/signatory.module';
import { SignyEmailModule } from './signy-email/signy.email.module';
import { SignyShareModule } from './signy-share/signy.share.module';
import { SignyModule } from './signy/signy.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserModule } from './user/user.module';
import { VerificationModule } from './verification/verification.module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ApiModulesList: Array<Type<any>> = [
    AuthModule,
    UserModule,
    ContentModule,
    ProfileModule,
    VerificationModule,
    CompanyModule,
    BranchModule,
    RoleModule,
    SignyModule,
    ContactModule,
    DocumentInputModule,
    DocumentModule,
    SignatoryModule,
    SignyEmailModule,
    SignyShareModule,
    SubscriptionModule,
];
