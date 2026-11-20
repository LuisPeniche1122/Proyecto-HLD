import type { IRoomGateway } from "../../domain/interfaces/i_room_gateway";
import type { CreateRoomResponseDTO} from "../../domain/dtos/room_dtos";
import type { WSEnvelope } from "../../domain/dtos/ws_dtos";
import { sharedWsClient } from "../network/web_socket_client";

export class RoomGateway implements IRoomGateway {
    private readonly apiUrl = import.meta.env.VITE_API_URL;

    async createRoom(token: string): Promise<CreateRoomResponseDTO> {
        const response = await fetch(`${this.apiUrl}/rooms/create_room`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || "Error al crear la sala en el servidor.");
        }
        return await response.json();
    }

    joinRoom(
        roomCode: string,
        token: string,
        onUpdate: (envelope: WSEnvelope) => void,
        onError: (error: Error) => void
    ): () => void {        
        // El cliente de red intentará conectarse. 
        // Si la sala está llena, el servidor cerrará el socket con el "reason"
        // y el ws.onclose del sharedWsClient disparará el onError para mostrar tu modal hermoso.
        sharedWsClient.connect(roomCode, token, onUpdate, onError);

        return () => {
            sharedWsClient.disconnect();
        };
    }
    
    changeRoomConfig(maxPlayers: number, isPrivate: boolean): void {
        sharedWsClient.sendEvent("change_room_config", {
            max_players: maxPlayers,
            is_private: isPrivate
        });
    }

    toggleReady(): void {
        sharedWsClient.sendEvent("toggle_ready");
    }

    kickPlayer(userId: string): void {
        sharedWsClient.sendEvent("kick_player", {
            target_user_id: userId
        });
    }

    sendChatMessage(message: string): void {
        sharedWsClient.sendEvent("send_chat_message", {
            text: message
        });
    }

    startGame(): void {
        sharedWsClient.sendEvent("start_game");
    }
}