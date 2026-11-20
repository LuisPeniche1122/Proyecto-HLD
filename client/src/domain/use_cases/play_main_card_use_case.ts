// src/application/use_cases/play_main_card_use_case.ts

import type { IGameGateway } from "../interfaces/i_game_gateway";

export class PlayMainCardUseCase {
    private readonly gateway: IGameGateway

    constructor(gameGateway: IGameGateway) {
        this.gateway = gameGateway;
    }

    execute(card_id: string): void {
        this.gateway.playMainCard(card_id);
    }
}