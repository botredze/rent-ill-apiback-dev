import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    CheckLogoExistanceInfo,
    CompanyEventsTypes,
    CreateCompanyRequest,
    CreateCompanyResponse,
    EditCompanyRequest,
    GetCompanyByIdRequest,
    GetCompanyResponse,
    InviteMemberRequest,
    SetCompanyLogoResponse,
    SetComponyLogoRequest,
    UploadCompanyLogoRequest,
} from '@signy/common';
import { UploadedImageInfo } from '@signy/upload';
import { ApiEC, ApiException, ApiSuccessResponse } from '@signy/exceptions';
import { S3Service, uploadFolders } from '@signy/s3';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CompanyService {
    private logger: Logger;
    constructor(
        @Inject('GATEWAY_COMPANY_PUBLISHER') private natsClient: ClientProxy,
        private readonly s3Service: S3Service
    ) {
        this.logger = new Logger(CompanyService.name);
    }

    async createCompany(dto: CreateCompanyRequest): Promise<CreateCompanyResponse> {
        return await lastValueFrom(
            this.natsClient.send<CreateCompanyResponse, CreateCompanyRequest>(CompanyEventsTypes.CreateCompany, dto)
        );
    }

    async editCompany(dto: EditCompanyRequest): Promise<GetCompanyResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetCompanyResponse, EditCompanyRequest>(CompanyEventsTypes.EditCompany, dto)
        );
    }

    async getCompanyById(dto: GetCompanyByIdRequest): Promise<GetCompanyResponse> {
        return await lastValueFrom(
            this.natsClient.send<GetCompanyResponse, GetCompanyByIdRequest>(CompanyEventsTypes.GetCompanyById, dto)
        );
    }

    async setCompanyLogo({ companyId, userId, logo }: UploadCompanyLogoRequest): Promise<SetCompanyLogoResponse> {
        const uploadedImage: SetCompanyLogoResponse = await this.uploadLogo(logo);

        if (!uploadedImage) throw new ApiException(ApiEC.InternalServerError);

        const uploadedLogo = await lastValueFrom(
            this.natsClient.send<SetCompanyLogoResponse, SetComponyLogoRequest>(CompanyEventsTypes.SetCompanyLogo, {
                userId,
                companyId,
                uploadedImage: uploadedImage.uploadedImage,
            })
        );
        if (uploadedLogo?.logoExists?.exists && uploadedLogo?.logoExists?.companyLogo) {
            await this.deleteCompanyLogo(uploadedLogo?.logoExists?.companyLogo);
        }
        return { uploadedImage: uploadedLogo.uploadedImage };
    }

    async uploadLogo(logo: Express.Multer.File): Promise<SetCompanyLogoResponse> {
        if (!logo?.buffer?.length) {
            throw new ApiException(ApiEC.ImageFileRequired);
        }
        const uploadedImage = await this.s3Service.uploadImage({
            stream: logo.buffer,
            mimetype: logo.mimetype,
            imageFolder: uploadFolders.companyLogos,
        });
        if (!uploadedImage?.imageUrl) {
            throw new ApiException(ApiEC.InternalServerError);
        }
        const uploadedThumbnail = await this.s3Service.resizeImage({ key: uploadedImage.imageKey });

        return { uploadedImage: { ...uploadedThumbnail, ...uploadedImage } };
    }

    async deleteCompanyLogo(dto: UploadedImageInfo): Promise<ApiSuccessResponse> {
        if (!dto.imageUrl) {
            return { ok: true };
        }
        const delImageResult = await this.s3Service.deleteFile({
            url: dto?.imageUrl,
            key: dto?.imageKey,
        });
        const delThumbResult = await this.s3Service.deleteFile({
            url: dto?.thumbnailUrl,
            key: dto?.thumbnailKey,
        });

        if (!delImageResult && !delThumbResult) {
            throw new ApiException(ApiEC.InternalServerError);
        }

        return { ok: true };
    }

    async deleteCompany(dto: GetCompanyByIdRequest): Promise<ApiSuccessResponse> {
        const deletedCompanyLogoData = await lastValueFrom(
            this.natsClient.send<CheckLogoExistanceInfo, GetCompanyByIdRequest>(CompanyEventsTypes.DeleteCompany, dto)
        );

        let ok = true;
        if (deletedCompanyLogoData?.companyLogo) {
            ok = (await this.deleteCompanyLogo(deletedCompanyLogoData.companyLogo)).ok;
        }

        return { ok };
    }

    async inviteMember(dto: InviteMemberRequest): Promise<ApiSuccessResponse> {
        return await lastValueFrom(
            this.natsClient.send<ApiSuccessResponse, InviteMemberRequest>(CompanyEventsTypes.InviteMember, dto)
        );
    }
}
