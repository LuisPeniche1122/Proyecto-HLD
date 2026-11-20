import { GameGateway } from "../../gateways/game_gateway";
import { ChangeGameConfigUseCase } from "../../../domain/use_cases/change_game_config_use_case";
import type { GameConfig } from "../../../domain/dtos/room_dtos";

// Fíjate que aquí usamos el GameGateway, respetando la segregación de interfaces
const gameGateway = new GameGateway();
const changeGameConfigUseCase = new ChangeGameConfigUseCase(gameGateway);

export const useChangeGameConfig = () => {
    
    const changeGameConfig = (newConfig: GameConfig) => {
        changeGameConfigUseCase.execute(newConfig);
    };

    return { changeGameConfig };
};