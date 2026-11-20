import { GameGateway } from "../../gateways/game_gateway";
import { RequestGameStateUseCase } from "../../../domain/use_cases/request_game_state_use_case";

const gameGateway = new GameGateway();
const requestGameStateUseCase = new RequestGameStateUseCase(gameGateway);

export const useRequestGameState = () => {
    
    const requestGameState = () => {
        requestGameStateUseCase.execute();
    };

    return { requestGameState };
};