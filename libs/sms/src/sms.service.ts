import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SendSmsResponse } from './dto';
import { SendSmsRequest } from './dto/requests';

@Injectable()
export class SmsService {
    private logger: Logger;
    private headers: Record<string, string> = { 'Content-Type': 'application-json' };
    private apiKey: string;
    constructor(private configService: ConfigService) {
        this.logger = new Logger(SmsService.name);
        this.apiKey = this.configService.get<string>('GLOBAL_SMS_API_KEY', '');
        this.headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    async sendSms({ phone, message, orignator }: SendSmsRequest): Promise<SendSmsResponse> {
        const res = await axios.get(
            encodeURI(
                `http://api.itnewsletter.co.il/api/restApiSms/sendSmsToRecipients?destinations=${phone}&ApiKey=${this.apiKey}&txtOriginator=${orignator}&txtSMSmessage=${message}`
            ),
            {
                headers: this.headers,
            }
        );
        // .then((resRaw) => {
        //     if (resRaw.data) {
        //         return { ok: true };
        //     }
        // })
        // .catch((err) => {
        //     this.logger.error('Error during SendSms:', err);
        //     return { ok: false };
        // });
        if (!res) {
            return { isSent: false };
        }

        return { isSent: true };
    }
}
