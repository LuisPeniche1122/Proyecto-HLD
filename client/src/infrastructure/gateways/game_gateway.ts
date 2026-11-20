import type { IGameGateway } from "../../domain/interfaces/i_game_gateway";
import type { GameConfig } from "../../domain/dtos/room_dtos";
import { sharedWsClient } from "../network/web_socket_client";

export class GameGateway implements IGameGateway {
    
    changeGameConfig(gameConfig: GameConfig): void {
        // Al servidor le mandamos la mochila completa bajo la llave 'game_config'
        sharedWsClient.sendEvent("change_game_config", {
            game_config: gameConfig
        });
    }

    requestGameState(): void {
        // Disparamos la acción que mapeamos en el MatchEventDispatcher del backend
        sharedWsClient.sendEvent("get_game_state");
    }

    selectCharacter(characterType: string): void {
        sharedWsClient.sendEvent("select_character", {
            character_type: characterType
        });
    }

    playMainCard(card_id: string): void {
        sharedWsClient.sendEvent("play_main_card", {
            card_id: card_id
        });
    }
}