// src/application/use_cases/select_character_use_case.ts

import type { IGameGateway } from "../interfaces/i_game_gateway";

export class SelectCharacterUseCase {
    private readonly gateway: IGameGateway

    constructor(gameGateway: IGameGateway) {
        this.gateway = gameGateway;
    }

    execute(characterType: string): void {
        this.gateway.selectCharacter(characterType);
    }
}