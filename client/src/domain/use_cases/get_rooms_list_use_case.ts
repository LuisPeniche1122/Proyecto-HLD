import type { RoomListItemDTO } from "../dtos/room_dtos";
import type { IRoomListGateway } from "../interfaces/i_room_list_gateway";

export class GetRoomsListUseCase {
    // Aplicamos tu regla estricta de privacidad
    private readonly __gateway: IRoomListGateway;

    constructor(gateway: IRoomListGateway) {
        this.__gateway = gateway;
    }

    /**
     * Ejecuta la observación de las salas.
     * Retorna la función de desuscripción.
     */
    execute(
        token: string,
        onUpdate: (rooms: RoomListItemDTO[]) => void,
        onError: (error: Error) => void
    ): () => void {
        // Aquí podríamos agregar filtros de negocio si fuera necesario
        return this.__gateway.observeRooms(token, onUpdate, onError);
    }
}