from typing import Optional
from src.domain.dtos.game_dtos import GameStateDTO
from src.domain.use_cases.select_character_use_case import SelectCharacterUseCase
from src.domain.use_cases.play_main_card_use_case import PlayMainCardUseCase
from src.domain.use_cases.get_game_state_use_case import GetGameStateUseCase

class MatchEventDispatcher:
    """Enrutador secundario que maneja exclusivamente acciones de la fase PLAYING."""

    def __init__(
        self,
        select_character_use_case: SelectCharacterUseCase,
        get_game_state_use_case: GetGameStateUseCase,
        play_main_card_use_case: PlayMainCardUseCase
    ):
        self.__select_character_use_case = select_character_use_case
        self.__get_game_state_use_case = get_game_state_use_case
        self.__play_main_card_use_case = play_main_card_use_case

    def dispatch(self, action: str, payload: dict, room_code: str, user_id: str) -> Optional[GameStateDTO]:
        try:
            # Match estructural para enrutar según la acción enviada por React
            match action:
                case "get_game_state":
                    return self.__get_game_state_use_case.execute(room_code, user_id)
                
                case "select_character":
                    return self.__select_character_use_case.execute(room_code, user_id, payload)
                
                case "play_main_card":
                    return self.__play_main_card_use_case.execute(room_code, user_id, payload)
                    
                case _:
                    print(f"⚠️ [MatchDispatcher] Acción desconocida o inválida para la fase de juego: {action}")
                    return None

        except Exception as e:
            # Los errores de dominio (ej. "Personaje ya elegido") caerán aquí 
            print(f"❌ [MatchDispatcher Error] Acción '{action}' falló: {str(e)}")
            return None