import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { IncomingWebhook } from '@slack/webhook';
import { SlackMessageRequest } from './dto';
import { SlackMessageType } from './slack.enums';

@Injectable()
export class SlackService {
    private readonly logger: Logger;
    private readonly client: IncomingWebhook;
    constructor(private configService: ConfigService) {
        this.logger = new Logger(SlackService.name);
        const url = this.configService.get('SLACK_WEBHOOK_URL');
        if (url && this.configService.get('SLACK_NOTIFICATIONS').toLowerCase() === 'true') {
            this.client = new IncomingWebhook(url);
        }
    }

    async sendMessage({ type = SlackMessageType.PlainText, text }: SlackMessageRequest): Promise<boolean> {
        if (!this.client) {
            return false;
        }
        try {
            let icon_emoji: string;
            switch (type) {
                case SlackMessageType.EmailCode:
                    icon_emoji = ':envelope_with_arrow:';
                    break;
                case SlackMessageType.PhoneCode:
                    icon_emoji = ':phone:';
                    break;
                default:
                    icon_emoji = ':bangbang:';
            }

            const result = await this.client.send({ text, icon_emoji });

            return result['text'] === 'ok';
        } catch (err) {
            this.logger.error(err);
        }
        return false;
    }
}
