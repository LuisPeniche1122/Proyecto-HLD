import type { GameConfig } from "../dtos/room_dtos";

export interface IGameGateway {
    /**
     * Envía la nueva configuración de la partida (temporizadores, expansiones).
     * Nota: En el backend usamos "change_config" agrupando sala y juego,
     * pero en el frontend lo separamos limpiamente.
     */
    changeGameConfig(gameConfig: GameConfig): void;
    requestGameState(): void;
    selectCharacter(characterType: string): void;
    playMainCard(card_ide: string): void;
}