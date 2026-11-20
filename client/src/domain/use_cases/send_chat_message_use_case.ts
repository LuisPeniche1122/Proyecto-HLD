import type { IRoomGateway } from "../interfaces/i_room_gateway";

export class SendChatMessageUseCase {
    private readonly roomGateway: IRoomGateway;

    constructor(roomGateway: IRoomGateway) {
        this.roomGateway = roomGateway;
    }

    execute(text: string): void {
        const sanitizedText = text.trim();
        if (!sanitizedText) return;
        this.roomGateway.sendChatMessage(sanitizedText);
    }
}