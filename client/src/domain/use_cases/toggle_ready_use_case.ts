import type { IRoomGateway } from "../interfaces/i_room_gateway";

export class ToggleReadyUseCase {
    private readonly gateway: IRoomGateway
    
    constructor(gateway: IRoomGateway) {
        this.gateway = gateway;
    }

    execute(): void {
        this.gateway.toggleReady();
    }
}