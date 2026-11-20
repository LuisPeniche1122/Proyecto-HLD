from fastapi import Depends

from src.domain.use_cases.send_chat_message_use_case import SendChatMessageUseCase
from src.domain.interfaces.room_repository import RoomRepository
from src.infrastructure.controllers.lobby_event_dispatcher import LobbyEventDispatcher
from src.infrastructure.controllers.match_event_dispatcher import MatchEventDispatcher
from src.infrastructure.controllers.main_event_dispatcher import MainEventDispatcher

from src.infrastructure.web.core_dependencies import get_room_repository
from src.infrastructure.web.lobby_event_dispatcher_dependencies import get_lobby_event_dispatcher
from src.infrastructure.web.match_event_dispatcher_dependencies import get_match_event_dispatcher

def get_send_chat_message_use_case(
    room_repository: RoomRepository = Depends(get_room_repository)
) -> SendChatMessageUseCase:
    return SendChatMessageUseCase(room_repository=room_repository)

def get_main_event_dispatcher(
    room_repository: RoomRepository = Depends(get_room_repository),
    send_chat_message_use_case: SendChatMessageUseCase = Depends(get_send_chat_message_use_case),
    lobby_dispatcher: LobbyEventDispatcher = Depends(get_lobby_event_dispatcher),
    match_dispatcher: MatchEventDispatcher = Depends(get_match_event_dispatcher)
) -> MainEventDispatcher:
    return MainEventDispatcher(
        room_repository=room_repository,
        send_chat_message_use_case=send_chat_message_use_case,
        lobby_dispatcher=lobby_dispatcher,
        match_dispatcher=match_dispatcher
    )