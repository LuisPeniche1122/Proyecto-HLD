import { RoomGateway } from "../../gateways/room_gateway";
import { KickPlayerUseCase } from "../../../domain/use_cases/kick_player_use_case";

const gateway = new RoomGateway();
const kickPlayerUseCase = new KickPlayerUseCase(gateway);

export const useKickPlayer = () => {
    const kickPlayer = (targetUserId: string) => {
        kickPlayerUseCase.execute(targetUserId);
    };

    return { kickPlayer };
};