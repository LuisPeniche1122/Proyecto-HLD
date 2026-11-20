import type { IGameGateway } from "../interfaces/i_game_gateway";

export class RequestGameStateUseCase {
    private gateway: IGameGateway;

    constructor(gateway: IGameGateway) {
        this.gateway = gateway;
    }

    execute(): void {
        this.gateway.requestGameState();
    }
}