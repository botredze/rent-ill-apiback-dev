export class SignPdfRequest {
    pdf: Buffer;
    certificate: Buffer;
}

export class VeifyRequest {
    data: Buffer;
    publicKey: string;
    signature: string;
}

export class CheckIfSignatureExistsRequest {
    pdf: Buffer;
}
