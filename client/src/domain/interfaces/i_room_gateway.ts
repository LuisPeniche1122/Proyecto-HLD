import type {
    CreateRoomResponseDTO, 
} from "../dtos/room_dtos";

import type { WSEnvelope } from "../dtos/ws_dtos"; 

export interface IRoomGateway {
    /**
     * (HTTP en Infra) - Acción de un solo toque.
     * Crea una sala y devuelve el código generado.
     */
    createRoom(token: string): Promise<CreateRoomResponseDTO>;

    /**
     * (WebSocket en Infra) - Flujo de datos continuo.
     * Se conecta a la sala y escucha las actualizaciones de la "Fotografía" de la mesa.
     * Retorna una función para desconectarse.
     */
    joinRoom(
        roomCode: string,
        token: string,
        onUpdate: (envelope: WSEnvelope) => void,
        onError: (error: Error) => void
    ): () => void;

    changeRoomConfig(maxPlayers: number, isPrivate: boolean): void;
    
    toggleReady(): void;

    kickPlayer(userId: string): void;

    sendChatMessage(message: string): void;

    startGame(): void;
}