import type { RoomStateDTO } from "./room_dtos";
import type { GameStateDTO } from "./game_dtos";

// 1. El contenido del paquete
export interface SyncStatePayload {
    room: RoomStateDTO | null;
    game: GameStateDTO | null;
}

// 2. El sobre maestro
export interface WSEnvelope {
    event: string; // ej: "sync_state", "error", "chat_message"
    payload: any;  // Usamos 'any' aquí o SyncStatePayload si quieres ser estricto
}