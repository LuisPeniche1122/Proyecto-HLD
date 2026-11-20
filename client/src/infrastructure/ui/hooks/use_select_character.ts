// src/infrastructure/ui/hooks/use_select_character.ts

import { GameGateway } from "../../gateways/game_gateway";
import { SelectCharacterUseCase } from "../../../domain/use_cases/select_character_use_case";

const gateway = new GameGateway();
const selectCharacterUseCase = new SelectCharacterUseCase(gateway);

export const useSelectCharacter = () => {
    const selectCharacter = (characterType: string) => {
        selectCharacterUseCase.execute(characterType);
    };

    return { selectCharacter };
};