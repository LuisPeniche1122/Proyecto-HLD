import type { IRoomGateway } from "../interfaces/i_room_gateway";

export class ChangeRoomConfigUseCase {
    private readonly gateway: IRoomGateway
    
    constructor(gateway: IRoomGateway) {
        this.gateway = gateway;
    }

    execute(maxPlayers: number, isPrivate: boolean): void {
        this.gateway.changeRoomConfig(maxPlayers, isPrivate);
    }
}