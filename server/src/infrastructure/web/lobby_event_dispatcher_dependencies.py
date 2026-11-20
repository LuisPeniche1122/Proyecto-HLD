from fastapi import Depends
from src.domain.use_cases.kick_player_use_case import KickPlayerUseCase
from src.domain.use_cases.start_game_use_case import StartGameUseCase
from src.domain.use_cases.update_game_config_use_case import UpdateGameConfigUseCase
from src.domain.use_cases.toggle_ready_use_case import ToggleReadyUseCase
from src.domain.use_cases.update_room_config_use_case import UpdateRoomConfigUseCase

from src.domain.interfaces.room_repository import RoomRepository
from src.domain.interfaces.game_repository import GameRepository
from src.domain.interfaces.character_store import CharacterStore
from src.domain.interfaces.card_set_store import CardSetStore
from src.infrastructure.controllers.lobby_event_dispatcher import LobbyEventDispatcher
from src.infrastructure.web.core_dependencies import get_game_repository, get_room_repository
from src.infrastructure.web.match_event_dispatcher_dependencies import get_character_store, get_card_set_store, get_game_flow_service
from src.domain.services.game_flow_service import GameFlowService

def get_update_room_config_use_case(
    room_repository: RoomRepository = Depends(get_room_repository)
) -> UpdateRoomConfigUseCase:
    return UpdateRoomConfigUseCase(room_repository=room_repository)

def get_toggle_ready_use_case(
    room_repository: RoomRepository = Depends(get_room_repository)
) -> ToggleReadyUseCase:
    return ToggleReadyUseCase(room_repository=room_repository)

def update_game_config_use_case(
    room_repository: RoomRepository = Depends(get_room_repository)
) -> UpdateGameConfigUseCase:
    return UpdateGameConfigUseCase(room_repository=room_repository)

def get_kick_player_use_case(
    room_repository: RoomRepository = Depends(get_room_repository)
) -> KickPlayerUseCase:
    return KickPlayerUseCase(room_repository=room_repository)

def get_start_game_use_case(
    room_repository: RoomRepository = Depends(get_room_repository),
    game_repository: GameRepository = Depends(get_game_repository),
    character_store: CharacterStore = Depends(get_character_store),
    card_set_store: CardSetStore = Depends(get_card_set_store),
    game_flow_service: GameFlowService = Depends(get_game_flow_service)
) -> StartGameUseCase:
    return StartGameUseCase(
    room_repository=room_repository,
    game_repository=game_repository,
    character_store=character_store,
    card_set_store=card_set_store,
    game_flow_service=game_flow_service
    )

def get_lobby_event_dispatcher(
    update_room_config_use_case: UpdateRoomConfigUseCase = Depends(get_update_room_config_use_case),
    update_game_config_use_case: UpdateGameConfigUseCase = Depends(update_game_config_use_case),
    toggle_ready_use_case: ToggleReadyUseCase = Depends(get_toggle_ready_use_case),
    kick_player_use_case: KickPlayerUseCase = Depends(get_kick_player_use_case),
    start_game_use_case: StartGameUseCase = Depends(get_start_game_use_case)
    
) -> LobbyEventDispatcher:
    return LobbyEventDispatcher(
    update_room_config_use_case=update_room_config_use_case,
    update_game_config_use_case=update_game_config_use_case,
    toggle_ready_use_case=toggle_ready_use_case,
    kick_player_use_case=kick_player_use_case,
    start_game_use_case=start_game_use_case
    
)