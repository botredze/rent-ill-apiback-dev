import { RpcException } from '@nestjs/microservices';
import qr from 'qr-image';

export const generateQrCode = async (
    url: string
): Promise<{
    data?: string | Buffer;
    err?: RpcException;
}> => {
    try {
        const strData = JSON.stringify(url);
        const qrCode = qr.imageSync(strData, { type: 'png', ec_level: 'H' });
        return { data: qrCode };
    } catch (err) {
        return { err };
    }
};
