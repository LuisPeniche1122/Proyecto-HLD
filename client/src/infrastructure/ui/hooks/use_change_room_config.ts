import { RoomGateway } from "../../gateways/room_gateway";
import { ChangeRoomConfigUseCase } from "../../../domain/use_cases/change_room_config_use_case";

// Instanciamos el gateway y el caso de uso una sola vez fuera del hook
const roomGateway = new RoomGateway();
const changeRoomConfigUseCase = new ChangeRoomConfigUseCase(roomGateway);

export const useChangeRoomConfig = () => {
    
    const changeRoomConfig = (maxPlayers: number, isPrivate: boolean) => {
        // Ejecutamos el caso de uso puro, sin saber nada de WebSockets o APIs
        changeRoomConfigUseCase.execute(maxPlayers, isPrivate);
    };

    return { changeRoomConfig };
};