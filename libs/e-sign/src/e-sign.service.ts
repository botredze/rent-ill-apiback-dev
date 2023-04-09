/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable, Logger } from '@nestjs/common';
import {
    // CheckIfSignatureExistsRequest,
    GenerateKeyPairResponse,
    SignPdfRequest,
    SignResponse,
    // VerifyResponse,
} from './dto';
import { ApiEC, ApiException } from '@signy/exceptions';
import crypto from 'crypto';
import SignPDF from './utils/sign.pdf';
@Injectable()
export class ESignService {
    private logger: Logger;
    private readonly password: string;
    private readonly signPdfUtil: SignPDF;
    constructor() {
        this.logger = new Logger(ESignService.name);
        this.password = crypto.pseudoRandomBytes(25).toString('base64');
        this.signPdfUtil = new SignPDF();
    }
    async generateKeyPair(): Promise<GenerateKeyPairResponse> {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: this.password,
            },
        });

        return {
            publicKey,
            privateKey,
        };
    }

    async signPdf({ pdf, certificate }: SignPdfRequest): Promise<SignResponse> {
        if (!pdf) {
            throw new ApiException(ApiEC.WrongInput);
        }

        const p12Keys = await this.generateKeyPair();

        if (!p12Keys) {
            throw new ApiException(ApiEC.InternalServerError);
        }

        const sign = crypto.createSign('SHA512');
        sign.update(pdf);
        sign.end();

        const signature = sign.sign(
            {
                key: p12Keys.privateKey,
                passphrase: this.password,
            },
            'base64'
        );

        const signedPdf = await this.signPdfUtil.signPDF(pdf, signature, certificate);
        return {
            data: signedPdf,
            signature,
            privateKey: p12Keys.privateKey,
            publicKey: p12Keys.publicKey,
        };
    }

    // async verify({ data, publicKey, signature }: VeifyRequest): Promise<VerifyResponse> {
    //     if (!data || !publicKey || !signature) {
    //         throw new ApiException(ApiEC.WrongInput);
    //     }
    //     console.log('VERIFY++++++++++++++++++++++++++++++++');
    //     console.log('data', data);
    //     console.log('datasignature', signature);
    //     const verify = crypto.createVerify('SHA512');
    //     verify.update(signature);
    //     verify.end();

    //     const verified: boolean = verify.verify({ key: publicKey }, signature, 'base64');

    //     return {
    //         verified,
    //     };
    // }

    // async checkIfSignatureExists({ pdf }: CheckIfSignatureExistsRequest): Promise<VerifyResponse> {
    //     const pdfParser = new PDFparser();
    //     pdfParser.parseBuffer(pdf);
    //     console.log(pdfParser);
    // const { signatures } = verifyPdf(pdf);
    // if (signatures?.length) {
    // return { verified: true };
    // } else {
    //     return { verified: false };
    // }
    // }
}
