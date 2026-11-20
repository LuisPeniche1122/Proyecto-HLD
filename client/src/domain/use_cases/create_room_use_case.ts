import type { IRoomGateway } from "../interfaces/i_room_gateway";
import type { CreateRoomResponseDTO } from "../dtos/room_dtos";

export class CreateRoomUseCase {
    private readonly roomGateway: IRoomGateway

    constructor(roomGateway: IRoomGateway) {
        this.roomGateway = roomGateway;
    }

    async execute(token: string): Promise<CreateRoomResponseDTO> {
        // Aquí podrías agregar validaciones de dominio del frontend antes de enviar

        return await this.roomGateway.createRoom(token);
    }
}