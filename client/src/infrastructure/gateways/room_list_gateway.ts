import type { RoomListItemDTO } from "../../domain/dtos/room_dtos";
import { FetchRoomsError } from "../../domain/exceptions/room_exceptions";
import type { IRoomListGateway } from "../../domain/interfaces/i_room_list_gateway";

export class RoomListGateway implements IRoomListGateway {
    private readonly __wsUrl: string;

    constructor() {
        const baseUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";
        
        // Lo adjuntamos como query parameter (?token=...)
        this.__wsUrl = `${baseUrl}/rooms/list`;
    }

    observeRooms(
        token: string,
        onUpdate: (rooms: RoomListItemDTO[]) => void,
        onError: (error: Error) => void
    ): () => void {
        let socket: WebSocket;

        try {
            socket = new WebSocket(this.__wsUrl+`?token=${token}`);
        } catch (err) {
            onError(new FetchRoomsError());
            return () => {};
        }

        socket.onmessage = (event) => {
            try {
                // Pasamos la data cruda directamente al callback
                const rawData: RoomListItemDTO[] = JSON.parse(event.data);
                onUpdate(rawData);
            } catch (err) {
                onError(new Error("Error al procesar la lista de salas del servidor."));
            }
        };

        socket.onerror = () => {
            onError(new FetchRoomsError());
        };

        return () => {
            // 1. DESCONECTAMOS LOS EVENTOS (Anti-Strict Mode)
            // Esto asegura que un socket moribundo no dispare falsas alarmas
            socket.onmessage = null;
            socket.onerror = null;
            socket.onclose = null;

            // 2. Ahora sí, lo cerramos en paz
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        };
    }
}