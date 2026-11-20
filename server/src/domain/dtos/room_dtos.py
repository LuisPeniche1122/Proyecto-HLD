from typing import List
from pydantic import BaseModel

from src.domain.entities.room import Room
from src.domain.value_objects.game_config import GameConfig

class RoomListItemDTO(BaseModel):
    room_code: str # Actúa como identificador y código de acceso
    host_username: str 
    player_count: int
    max_players: int
    game_config: GameConfig

class CreateRoomResponseDTO(BaseModel):
    """Respuesta exitosa al crear una sala."""
    room_code: str

class PlayerSnapshotDTO(BaseModel):
    """Representa a un jugador individual dentro de la sala."""
    user_id: str
    username: str
    is_host: bool
    is_ready: bool
    # En el futuro aquí agregaremos: is_ready, avatar_url, etc.

class ChatMessageDTO(BaseModel):
    user: str
    text: str

class RoomStateDTO(BaseModel):
    """
    La 'Fotografía' completa del estado actual de la sala.
    Esto es lo que React usará como 'Fuente de la Verdad' para renderizar.
    """
    room_code: str
    max_players: int
    is_private: bool
    room_phase: str
    is_full: bool
    players: List[PlayerSnapshotDTO]
    game_config: GameConfig
    chat_history: List[ChatMessageDTO]

    @classmethod
    def from_entity(cls, room: Room) -> "RoomStateDTO":
        """
        Fábrica centralizada: Construye la fotografía a partir de la Entidad.
        """
        players_dto: List[PlayerSnapshotDTO] = []
        
        for p_id, p_name in room.players.items():
            players_dto.append(PlayerSnapshotDTO(
                user_id=p_id,
                username=p_name,
                is_host=(p_id == room.host_id), # Verificamos si este ID coincide con el puntero del host
                is_ready=(p_id in room.ready_player_ids) # Verificamos si este ID está en el conjunto de jugadores listos
            ))
        
        chat_dto: List[ChatMessageDTO] = []
        for msg in room.chat_history:
            chat_dto.append(ChatMessageDTO(user=msg["user"], text=msg["text"]))
            
        return cls(
            room_code=room.code,
            max_players=room.max_players,
            is_private=room.is_private,
            room_phase=room.room_phase,
            is_full=room.is_full(),
            players=players_dto,
            game_config=room.game_config,
            chat_history=chat_dto
        )