import { RoomGateway } from "../../gateways/room_gateway";
import { ToggleReadyUseCase } from "../../../domain/use_cases/toggle_ready_use_case";

const roomGateway = new RoomGateway();
const toggleReadyUseCase = new ToggleReadyUseCase(roomGateway);

export const useToggleReady = () => {
    
    const toggleReady = () => {
        toggleReadyUseCase.execute();
    };

    return { toggleReady };
};