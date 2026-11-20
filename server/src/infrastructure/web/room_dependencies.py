from fastapi import Depends
from src.domain.use_cases.create_room_use_case import CreateRoomUseCase
from src.domain.use_cases.join_room_use_case import JoinRoomUseCase
from src.domain.use_cases.leave_room_use_case import LeaveRoomUseCase
from src.domain.use_cases.get_rooms_list_use_case import GetRoomsListUseCase

from src.domain.interfaces.room_repository import RoomRepository
from src.domain.interfaces.authentication_token_provider import AuthenticationTokenProvider
from src.domain.interfaces.user_repository import UserRepository
from src.domain.interfaces.room_code_generator import RoomCodeGenerator

from src.infrastructure.repositories.in_memory_room_repository import InMemoryRoomRepository
from src.infrastructure.web.websockets.rooms_list_connection_manager import RoomListConnectionManager
from src.infrastructure.controllers.room_controller import RoomController
from src.infrastructure.services.room_code_generator import RandomRoomCodeGenerator
from src.infrastructure.web.websockets.room_connection_manager import RoomConnectionManager
from src.infrastructure.controllers.main_event_dispatcher import MainEventDispatcher

from src.infrastructure.web.core_dependencies import get_user_repository, get_room_repository, get_token_provider
from src.infrastructure.web.main_event_dispatchers_dependencies import get_main_event_dispatcher
from src.domain.interfaces.game_repository import GameRepository
from src.domain.assemblers.game_state_assembler import GameStateAssembler
from src.infrastructure.web.match_event_dispatcher_dependencies import get_game_state_assembler, get_game_repository, get_game_flow_service
from src.infrastructure.web.websockets.game_timers_manager import GameTimersManager
from src.domain.use_cases.timeout_phase_use_case import TimeoutPhaseUseCase
from src.domain.services.game_flow_service import GameFlowService


# ==========================================
# SINGLETONS
# ==========================================
__room_list_manager_instance = RoomListConnectionManager()
__room_manager_instance = RoomConnectionManager()
__game_timers_manager_instance = None

# ==========================================
# FÁBRICAS
# ==========================================
def get_room_list_manager() -> RoomListConnectionManager:
    return __room_list_manager_instance

def get_room_manager() -> RoomConnectionManager:
    return __room_manager_instance

def get_room_code_generator() -> RoomCodeGenerator:
    return RandomRoomCodeGenerator()

def get_rooms_list_use_case(repository: RoomRepository = Depends(get_room_repository)) -> GetRoomsListUseCase:
    return GetRoomsListUseCase(room_repository=repository)

def get_create_room_use_case(repository: RoomRepository = Depends(get_room_repository),
                             code_generator: RoomCodeGenerator = Depends(get_room_code_generator)) -> CreateRoomUseCase:
    return CreateRoomUseCase(room_repository=repository, code_generator=code_generator)

def get_join_room_use_case(room_repository: RoomRepository = Depends(get_room_repository)) -> JoinRoomUseCase:
    return JoinRoomUseCase(room_repository=room_repository)

def get_leave_room_use_case(
    repository: RoomRepository = Depends(get_room_repository),
    user_repository: UserRepository = Depends(get_user_repository)
) -> LeaveRoomUseCase:
    return LeaveRoomUseCase(room_repository=repository, user_repository=user_repository)

def get_timeout_phase_use_case (
    repository: GameRepository = Depends(get_game_repository),
    assembler: GameStateAssembler = Depends(get_game_state_assembler),
    game_flow_service: GameFlowService = Depends(get_game_flow_service)
) -> TimeoutPhaseUseCase:
    return TimeoutPhaseUseCase(game_repository=repository, assembler=assembler, game_flow_service=game_flow_service)

def get_timers_manager(
    timeout_use_case: TimeoutPhaseUseCase = Depends(get_timeout_phase_use_case)
) -> GameTimersManager:
    global __game_timers_manager_instance
    
    # Lo creamos SOLO la primera vez que alguien lo pide, asegurando que sea Singleton.
    # FastAPI ya hizo el trabajo sucio de armar el 'timeout_use_case' y pasárnoslo aquí.
    if __game_timers_manager_instance is None:
        __game_timers_manager_instance = GameTimersManager(timeout_phase_use_case=timeout_use_case)
        
    return __game_timers_manager_instance


def get_room_controller(
    rooms_list_use_case: GetRoomsListUseCase = Depends(get_rooms_list_use_case),
    create_room_use_case: CreateRoomUseCase = Depends(get_create_room_use_case),
    join_room_use_case: JoinRoomUseCase = Depends(get_join_room_use_case),
    leave_room_use_case: LeaveRoomUseCase = Depends(get_leave_room_use_case),
    room_list_manager: RoomListConnectionManager = Depends(get_room_list_manager),
    room_manager: RoomConnectionManager = Depends(get_room_manager),
    token_provider: AuthenticationTokenProvider = Depends(get_token_provider),
    main_event_dispatcher: MainEventDispatcher = Depends(get_main_event_dispatcher),
    game_timers_manager: GameTimersManager = Depends(get_timers_manager)
) -> RoomController:
    return RoomController(
        get_rooms_list_use_case=rooms_list_use_case,
        create_room_use_case=create_room_use_case,
        join_room_use_case=join_room_use_case,
        leave_room_use_case=leave_room_use_case,
        room_list_manager=room_list_manager,
        room_manager=room_manager,
        token_provider=token_provider,
        main_event_dispatcher=main_event_dispatcher,
        game_timers_manager=game_timers_manager
    )