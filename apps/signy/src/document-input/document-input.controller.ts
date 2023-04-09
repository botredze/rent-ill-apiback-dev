import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
    AddContactToAllInputsRequest,
    GetAllDocumentGroupsAndContactsRequest,
    RemoveContactFromInputRequest,
} from '@signy/document';
import {
    CreateInputForPdfRequest,
    CreateInputForPdfResponse,
    DocmentInputEventType,
    GetDocumentInputsWithSearchRequest,
    GetDocumentInputsWithSearchResponse,
    RemoveDocumentInputRequest,
    UpdateInputForPdfRequest,
    UpdateInputForPdfResponse,
} from '@signy/document-input';
import { ApiSuccessResponse } from '@signy/exceptions';
import { DocumentInputService } from './document-input.service';

@Controller()
export class DocumentInputController {
    constructor(private readonly documentInputService: DocumentInputService) {}

    @MessagePattern(DocmentInputEventType.CreateInputForPdf)
    async createInputForPdf(dto: CreateInputForPdfRequest): Promise<CreateInputForPdfResponse> {
        return this.documentInputService.createInputForPdf(dto);
    }

    @MessagePattern(DocmentInputEventType.UpdateInputForPdf)
    async updateInputForPdf(dto: UpdateInputForPdfRequest): Promise<UpdateInputForPdfResponse> {
        return this.documentInputService.updateInputForPdf(dto);
    }

    @MessagePattern(DocmentInputEventType.GetDocumentInputs)
    async getDocumentInputs(dto: GetDocumentInputsWithSearchRequest): Promise<GetDocumentInputsWithSearchResponse> {
        return this.documentInputService.getDocumentInputs(dto);
    }

    @MessagePattern(DocmentInputEventType.RemoveDocumentInput)
    async removeDocumentInput(dto: RemoveDocumentInputRequest): Promise<ApiSuccessResponse> {
        return this.documentInputService.removeDocumentInput(dto);
    }

    @MessagePattern(DocmentInputEventType.MergeAllContactsToInputs)
    async mergeAllContactsToInputs(dto: GetAllDocumentGroupsAndContactsRequest): Promise<ApiSuccessResponse> {
        return this.documentInputService.mergeAllContactsToInputs(dto);
    }

    @MessagePattern(DocmentInputEventType.AddContactToAllInputs)
    async addContactToAllInputs(dto: AddContactToAllInputsRequest): Promise<ApiSuccessResponse> {
        return this.documentInputService.addContactToAllInputs(dto);
    }

    @MessagePattern(DocmentInputEventType.RemoveContactFromInput)
    async removeContactFromInput(dto: RemoveContactFromInputRequest): Promise<ApiSuccessResponse> {
        return this.documentInputService.removeContactFromInput(dto);
    }
}
