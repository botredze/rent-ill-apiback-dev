export class GenerateKeyPairResponse {
    publicKey: string;
    privateKey: string;
}

export class SignResponse {
    data: Buffer;
    signature: string;
    publicKey: string;
    privateKey: string;
}

export class VerifyResponse {
    verified: boolean;
}
