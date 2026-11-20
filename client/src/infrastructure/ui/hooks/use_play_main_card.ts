import { GameGateway } from "../../gateways/game_gateway";
import { PlayMainCardUseCase } from "../../../domain/use_cases/play_main_card_use_case";

const gateway = new GameGateway();
const playMainCardUseCase = new PlayMainCardUseCase(gateway);

export const usePlayMainCard = () => {
    const playMainCard = (card_id: string) => {
        playMainCardUseCase.execute(card_id);
    };

    return { playMainCard };
};