export default class SignPDF {
    async signPDF(pdfFile: Buffer, signature: string, certificate: Buffer): Promise<Buffer>;
}
