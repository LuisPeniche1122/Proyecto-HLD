from fastapi import Depends

from src.infrastructure.stores.static_character_store import StaticCharacterStore
from src.infrastructure.stores.static_card_set_store import StaticCardSetStore
from src.domain.assemblers.game_state_assembler import GameStateAssembler
from src.domain.use_cases.select_character_use_case import SelectCharacterUseCase
from src.domain.use_cases.get_game_state_use_case import GetGameStateUseCase
from src.domain.use_cases.play_main_card_use_case import PlayMainCardUseCase
from src.domain.interfaces.game_repository import GameRepository
from src.domain.interfaces.character_store import CharacterStore
from src.domain.interfaces.card_set_store import CardSetStore
from src.infrastructure.controllers.match_event_dispatcher import MatchEventDispatcher
from src.domain.services.game_flow_service import GameFlowService

from src.infrastructure.web.core_dependencies import get_game_repository

# 1. Singletons Globales (Para no borrar la RAM en cada petición)
__character_store = StaticCharacterStore()
__card_set_Store = StaticCardSetStore()

# 2. Proveedores Base
def get_character_store() -> CharacterStore:
    return __character_store

def get_card_set_store() -> CardSetStore:
    return __card_set_Store

# 3. Ensambladores
def get_game_state_assembler(
    character_store: CharacterStore = Depends(get_character_store)
) -> GameStateAssembler:
    return GameStateAssembler(character_store=character_store)

# 4. Servicios
def get_game_flow_service(
    character_store: CharacterStore = Depends(get_character_store)  
):
    return GameFlowService(character_store=character_store)

# 4. Casos de Uso
def get_select_character_use_case(
    game_repository: GameRepository = Depends(get_game_repository),
    assembler: GameStateAssembler = Depends(get_game_state_assembler),
    game_flow_service: GameFlowService = Depends(get_game_flow_service)
) -> SelectCharacterUseCase:
    return SelectCharacterUseCase(
        game_repository=game_repository, 
        assembler=assembler,
        game_flow_service=game_flow_service
    )

def get_get_game_state_use_case(
    game_repository: GameRepository = Depends(get_game_repository),
    assembler: GameStateAssembler = Depends(get_game_state_assembler)
) -> GetGameStateUseCase:
    return GetGameStateUseCase(
        game_repository=game_repository, 
        assembler=assembler
    )

def get_play_main_card_use_case(
        game_repository : GameRepository = Depends(get_game_repository),
        assembler : GameStateAssembler = Depends(get_game_state_assembler),
        game_flow_service : GameFlowService = Depends(get_game_flow_service)
) -> PlayMainCardUseCase:
    return PlayMainCardUseCase(
        game_repository=game_repository,
        assembler=assembler,
        game_flow_service=game_flow_service
    )

# 5. Dispatcher de Partida
def get_match_event_dispatcher(
    select_character_use_case: SelectCharacterUseCase = Depends(get_select_character_use_case),
    get_game_state_use_case: GetGameStateUseCase = Depends(get_get_game_state_use_case),
    play_main_card_use_case: PlayMainCardUseCase = Depends(get_play_main_card_use_case)
) -> MatchEventDispatcher:
    return MatchEventDispatcher(
        select_character_use_case=select_character_use_case,
        get_game_state_use_case=get_game_state_use_case,
        play_main_card_use_case=play_main_card_use_case
    )