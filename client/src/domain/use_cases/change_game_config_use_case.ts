import type { IGameGateway } from "../interfaces/i_game_gateway";
import type { GameConfig } from "../dtos/room_dtos";

export class ChangeGameConfigUseCase {
    private readonly gateway: IGameGateway
    
    constructor(gateway: IGameGateway) {
        this.gateway = gateway;
    }

    execute(gameConfig: GameConfig): void {
        this.gateway.changeGameConfig(gameConfig);
    }
}