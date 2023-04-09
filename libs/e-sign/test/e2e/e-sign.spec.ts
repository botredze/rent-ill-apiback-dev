import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import fs from 'fs';
import path from 'path';
import { ESignService } from '../../src/e-sign.service';
describe('E-Sign - libs (e2e)', () => {
    jest.setTimeout(60 * 1000);
    // let privateKey: string;
    // let publicKey: string;
    // let signature: string;
    let app: INestApplication;
    let stockPdf: Buffer;
    // let signedPdf: Buffer;
    let eSignService: ESignService;

    beforeAll(async () => {
        // eslint-disable-next-line no-useless-catch
        try {
            const moduleRef = await Test.createTestingModule({
                providers: [ESignService],
            }).compile();
            app = moduleRef.createNestApplication();
            await app.init();
            eSignService = app.get(ESignService);
        } catch (err) {
            throw err;
        }
    });
    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });
    describe('E-Sign - methods (e2e)', () => {
        it('Generate new key pair for client and server side', async () => {
            const keyPair = await eSignService.generateKeyPair();
            expect(keyPair.privateKey).not.toBeNull();
            expect(keyPair.publicKey).not.toBeNull();
        });

        it('Sign new document by providing data and private key and return signature', async () => {
            const assetsPath = path.join(__dirname, '../assets');
            stockPdf = fs.readFileSync(`${assetsPath}/test.pdf`);
            const certificateP12 = fs.readFileSync(`${assetsPath}/certificate.p12`);
            const sign = await eSignService.signPdf({ pdf: stockPdf, certificate: certificateP12 });
            fs.writeFileSync(`${assetsPath}/signed.pdf`, sign.data);
            // signedPdf = sign.data;
            // signature = sign.signature;
            // publicKey = sign.publicKey;
            // privateKey = sign.privateKey;
            expect(sign.signature).not.toBeNull();
            expect(sign.data).not.toBeNull();
            expect(sign.publicKey).not.toBeNull();
            expect(sign.privateKey).not.toBeNull();
        });

        // it('Verify signed document', async () => {
        //     const verified = await eSignService.checkIfSignatureExists({ pdf: signedPdf });
        //     expect(verified.verified).toBe(true);
        // });
    });
});
