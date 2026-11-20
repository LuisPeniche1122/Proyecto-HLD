from fastapi import APIRouter, Header, WebSocket, Depends, Query
from src.domain.dtos.room_dtos import CreateRoomResponseDTO
from src.infrastructure.web.room_dependencies import get_room_controller
from src.infrastructure.controllers.room_controller import RoomController

wsrouter = APIRouter(prefix="/ws/rooms", tags=["Rooms"])

@wsrouter.websocket("/list")
async def rooms_list_websocket(
    websocket: WebSocket,
    # Atrapamos el token crudo directamente de la URL (?token=...)
    token: str = Query(None), 
    controller: RoomController = Depends(get_room_controller)
):
    """
    Endpoint WebSocket para el listado de salas.
    """
    await controller.handle_rooms_list_websocket(websocket=websocket, raw_token=token)


apirouter = APIRouter(prefix="/api/rooms", tags=["Rooms"])

@apirouter.post("/create_room", response_model=CreateRoomResponseDTO, status_code=201)
async def create_room_endpoint(
    # Extraemos el header "Authorization" tal cual viene (ej. "Bearer eyJhb...")
    authorization: str = Header(None), 
    controller: RoomController = Depends(get_room_controller)
):
    """Endpoint REST para inicializar una sala."""
    # Le pasamos el header crudo al controlador
    return await controller.create_room(auth_header=authorization)

@wsrouter.websocket("/play/{room_code}")
async def join_room_websocket(
    websocket: WebSocket,
    room_code: str, # FastAPI inyecta la variable de la ruta aquí
    token: str = Query(None),
    controller: RoomController = Depends(get_room_controller)
):
    """Endpoint WebSocket para unirse a una sala específica."""
    await controller.handle_active_room_websocket(
        websocket=websocket, 
        room_code=room_code, 
        raw_token=token
    )