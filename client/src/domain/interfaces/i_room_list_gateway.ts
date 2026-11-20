import type { RoomListItemDTO } from "../dtos/room_dtos";

export interface IRoomListGateway {
    /**
     * Se suscribe al flujo en tiempo real de salas disponibles.
     * Llama a `onUpdate` cada vez que el servidor empuja una nueva lista.
     * Retorna una función para cancelar la suscripción y liberar memoria.
     */
    observeRooms(
        token: string,
        onUpdate: (rooms: RoomListItemDTO[]) => void,
        onError: (error: Error) => void
    ): () => void;
}