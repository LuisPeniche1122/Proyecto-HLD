from typing import Optional
from pydantic import BaseModel
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.use_cases.send_chat_message_use_case import SendChatMessageUseCase
from src.infrastructure.controllers.lobby_event_dispatcher import LobbyEventDispatcher
from src.infrastructure.controllers.match_event_dispatcher import MatchEventDispatcher
from src.domain.value_objects.room_phase import RoomPhase

class MainEventDispatcher:
    """Enrutador principal que delega las peticiones según la fase actual de la sala."""
    
    def __init__(
        self, 
        room_repository: RoomRepository,
        send_chat_message_use_case: SendChatMessageUseCase,
        lobby_dispatcher: LobbyEventDispatcher,
        match_dispatcher: MatchEventDispatcher
        # TODO: Aquí inyectaremos match_dispatcher, post_game_dispatcher, etc.
    ):
        self.__room_repository = room_repository
        self.__send_chat_message_use_case = send_chat_message_use_case
        self.__lobby_dispatcher = lobby_dispatcher
        self.__match_dispatcher = match_dispatcher

    def dispatch(self, action: str, payload: dict, room_code: str, user_id: str) -> Optional[BaseModel]:
        try:
            # 1. ACCIONES GLOBALES (Atajamos antes de revisar la fase)
            if action == "send_chat_message":
                return self.__send_chat_message_use_case.execute(room_code, user_id, payload)

            # 2. ACCIONES DE FASE (Consultamos cómo está la sala)
            room = self.__room_repository.find_by_code(room_code)
            if not room:
                return None
            
            # Usamos getattr por seguridad mientras implementas formalmente 'phase'
            current_phase = room.room_phase

            # 3. DELEGACIÓN
            match current_phase:
                case RoomPhase.LOBBY:
                    return self.__lobby_dispatcher.dispatch(action, payload, room_code, user_id)
                
                case RoomPhase.PLAYING:
                    return self.__match_dispatcher.dispatch(action, payload, room_code, user_id)

                case RoomPhase.FINISHED:
                    pass

                case _:
                    print(f"⚠️ [MainDispatcher] Fase desconocida: {current_phase}")
                    return None
                
        except Exception as e:
            print(f"❌ [MainDispatcher Error] Acción '{action}' falló: {str(e)}")
            return None