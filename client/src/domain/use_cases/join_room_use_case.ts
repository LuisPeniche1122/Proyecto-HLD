import type { IRoomGateway } from "../interfaces/i_room_gateway";
import type { WSEnvelope } from "../dtos/ws_dtos"; // <-- Importamos el sobre

export class JoinRoomUseCase {
    private gateway: IRoomGateway;

    constructor(gateway: IRoomGateway) {
        this.gateway = gateway;
    }

    execute(
        roomCode: string, 
        token: string, 
        onUpdate: (envelope: WSEnvelope) => void, // <-- Cambiamos a WSEnvelope
        onError: (error: Error) => void
    ): () => void {
        if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
            onError(new Error("El código de la sala no tiene un formato válido."));
            return () => {}; // Retornamos una función vacía si falló
        }
        return this.gateway.joinRoom(roomCode, token, onUpdate, onError);
    }
}