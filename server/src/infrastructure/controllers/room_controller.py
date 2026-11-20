from fastapi import HTTPException, WebSocket, WebSocketDisconnect
from starlette import status
from typing import List
from pydantic import BaseModel

from src.domain.use_cases.create_room_use_case import CreateRoomUseCase
from src.domain.use_cases.get_rooms_list_use_case import GetRoomsListUseCase
from src.domain.use_cases.join_room_use_case import JoinRoomUseCase
from src.domain.use_cases.leave_room_use_case import LeaveRoomUseCase

from src.domain.dtos.room_dtos import CreateRoomResponseDTO, RoomListItemDTO
from src.domain.exceptions import DomainException

from src.infrastructure.controllers import main_event_dispatcher
from src.infrastructure.web.websockets.rooms_list_connection_manager import RoomListConnectionManager
from src.infrastructure.web.websockets.room_connection_manager import RoomConnectionManager
from src.domain.interfaces.authentication_token_provider import AuthenticationTokenProvider
from src.infrastructure.web.websockets.game_timers_manager import GameTimersManager
from src.domain.value_objects.game_phase import GamePhase

class RoomController:
    """Maneja la capa de traducción de red (HTTP y WebSocket) para los casos de uso de Salas."""

    def __init__(
        self, 
        get_rooms_list_use_case: GetRoomsListUseCase, 
        create_room_use_case: CreateRoomUseCase,
        join_room_use_case: JoinRoomUseCase,
        leave_room_use_case: LeaveRoomUseCase,
        room_list_manager: RoomListConnectionManager,
        room_manager: RoomConnectionManager,
        token_provider: AuthenticationTokenProvider,
        main_event_dispatcher: main_event_dispatcher,
        game_timers_manager: GameTimersManager
    ):
        self.__get_rooms_list_use_case = get_rooms_list_use_case
        self.__create_room_use_case = create_room_use_case
        self.__join_room_use_case = join_room_use_case
        self.__leave_room_use_case = leave_room_use_case
        self.__room_list_manager = room_list_manager
        self.__room_manager = room_manager
        self.__token_provider = token_provider
        self.__main_event_dispatcher = main_event_dispatcher
        self.__game_timers_manager = game_timers_manager
        self.__game_timers_manager.set_broadcast_callback(self.__room_manager.broadcast_envelope)

    async def __verify_ws_token(self, websocket: WebSocket, raw_token: str) -> tuple[str, str]:
        if not raw_token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            raise ValueError("Token vacío")
            
        payload = self.__token_provider.verify_token(raw_token)
        if not payload or not payload.get("user_id"):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            raise ValueError("Token inválido")
            
        return payload.get("user_id"), payload.get("username", "Usuario Desconocido")

    async def __broadcast_lobby_update(self) -> None:
        current_rooms: List[RoomListItemDTO] = self.__get_rooms_list_use_case.execute()
        await self.__room_list_manager.broadcast_rooms([room.model_dump() for room in current_rooms])

    # ==========================================
    # ENDPOINTS WEBSOCKET
    # ==========================================
    async def handle_rooms_list_websocket(self, websocket: WebSocket, raw_token: str) -> None:
        try:
            await self.__verify_ws_token(websocket, raw_token)
        except ValueError:
            return 
        
        await self.__room_list_manager.connect(websocket)
        try:
            current_rooms = self.__get_rooms_list_use_case.execute()
            await websocket.send_json([r.model_dump() for r in current_rooms])

            while True:
                _ = await websocket.receive_text()
                
        except WebSocketDisconnect:
            self.__room_list_manager.disconnect(websocket)

    async def handle_active_room_websocket(self, websocket: WebSocket, room_code: str, raw_token: str) -> None:
        await websocket.accept()

        try:
            user_id, username = await self.__verify_ws_token(websocket, raw_token)
        except ValueError:
            return 
            
        try:
            room_snapshot = self.__join_room_use_case.execute(room_code=room_code, user_id=user_id, username=username)
            
            await self.__room_manager.connect(websocket, room_code, user_id)
            await self.__room_manager.broadcast_envelope(room_code, room_snapshot)
            await self.__broadcast_lobby_update()

            # ELIMINADO: current_local_phase = GamePhase.INITIALIZING.value

            while True:
                data = await websocket.receive_json()
                
                updated_snapshot = self.__main_event_dispatcher.dispatch(
                    action=data.get("action"), 
                    payload=data, 
                    room_code=room_code, 
                    user_id=user_id
                )
                
                if updated_snapshot:
                    # 1. Distribuimos el estado a todos los jugadores
                    await self.__room_manager.broadcast_envelope(room_code, updated_snapshot)
                    await self.__broadcast_lobby_update()

                    # 2. Le avisamos al Manager que evalúe si hubo un cambio
                    self.__game_timers_manager.handle_phase_transition(
                        room_code=room_code,
                        new_snapshot=updated_snapshot
                    )
                
        except DomainException as e:
            print(f"Error en sala {room_code}: {str(e)}")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=str(e))
            
        except WebSocketDisconnect:
            self.__room_manager.disconnect(websocket, room_code, user_id)
            updated_snapshot = self.__leave_room_use_case.execute(room_code=room_code, user_id=user_id)
            
            # Si el snapshot viene vacío, significa que la sala se eliminó porque todos se salieron
            if updated_snapshot:
                await self.__room_manager.broadcast_envelope(room_code, updated_snapshot)
            else:
                # Opcional: Limpiamos la memoria del Manager si la sala quedó vacía
                self.__game_timers_manager.clear_room_state(room_code)
                
            await self.__broadcast_lobby_update()

    # ==========================================
    # ENDPOINTS REST (HTTP)
    # ==========================================
    async def create_room(self, auth_header: str) -> CreateRoomResponseDTO:
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autorizado.")
            
        raw_token = auth_header.split(" ")[1]
        payload = self.__token_provider.verify_token(raw_token)
        
        if not payload or not payload.get("user_id"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido.")
            
        user_id = payload.get("user_id")
        user_username = payload.get("username", "Usuario Desconocido") 

        try:
            response = self.__create_room_use_case.execute(host_id=user_id, host_username=user_username)
            await self.__broadcast_lobby_update()
            
            return response
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))