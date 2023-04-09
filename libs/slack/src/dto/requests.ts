import { SlackMessageType } from '../slack.enums';

export class SlackMessageRequest {
    type: SlackMessageType;
    text: string;
}
