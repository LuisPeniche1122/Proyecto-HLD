import { RoomGateway } from "../../gateways/room_gateway";

const gateway = new RoomGateway();

export const useStartGame = () => {
    const startGame = () => {
        gateway.startGame();
    };

    return { startGame };
};