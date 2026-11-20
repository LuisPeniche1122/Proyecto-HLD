import type { IRoomGateway } from "../interfaces/i_room_gateway";

export class KickPlayerUseCase {
    private roomGateway: IRoomGateway;

    constructor(roomGateway: IRoomGateway) {
        this.roomGateway = roomGateway;
    }

    execute(targetUserId: string): void {
        if (!targetUserId) return;
        this.roomGateway.kickPlayer(targetUserId);
    }
}