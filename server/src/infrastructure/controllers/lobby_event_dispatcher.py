from typing import Optional
from src.domain.dtos.room_dtos import RoomStateDTO
from src.domain.use_cases.kick_player_use_case import KickPlayerUseCase
from src.domain.use_cases.start_game_use_case import StartGameUseCase
from src.domain.use_cases.update_game_config_use_case import UpdateGameConfigUseCase
from src.domain.use_cases.update_room_config_use_case import UpdateRoomConfigUseCase
from src.domain.use_cases.toggle_ready_use_case import ToggleReadyUseCase

class LobbyEventDispatcher:
    """Maneja EXCLUSIVAMENTE las acciones de la fase de Pre-Juego (Lobby)."""
    
    def __init__(
        self, 
        update_room_config_use_case: UpdateRoomConfigUseCase,
        update_game_config_use_case: UpdateGameConfigUseCase,
        toggle_ready_use_case: ToggleReadyUseCase,
        kick_player_use_case: KickPlayerUseCase,
        start_game_use_case: StartGameUseCase
    ):
        self.__update_room_config_use_case = update_room_config_use_case
        self.__update_game_config_use_case = update_game_config_use_case
        self.__toggle_ready_use_case = toggle_ready_use_case
        self.__kick_player_use_case = kick_player_use_case
        self.__start_game_use_case = start_game_use_case

    def dispatch(self, action: str, payload: dict, room_code: str, user_id: str) -> Optional[RoomStateDTO]:
        match action:
            case "change_room_config":
                return self.__update_room_config_use_case.execute(room_code, user_id, payload)
                
            case "toggle_ready":
                return self.__toggle_ready_use_case.execute(room_code, user_id)
                
            case "change_game_config":
                return self.__update_game_config_use_case.execute(room_code, user_id, payload)
            
            case "kick_player":
                return self.__kick_player_use_case.execute(room_code, user_id, payload)
            
            case "start_game":
                return self.__start_game_use_case.execute(room_code, user_id)

            case _:
                print(f"⚠️ [LobbyDispatcher] Acción ignorada/desconocida en Lobby: {action}")
                return None