from typing import List
from src.domain.entities.room import Room
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.exceptions import RoomNotFoundError
from src.domain.dtos.room_dtos import RoomStateDTO, PlayerSnapshotDTO

class JoinRoomUseCase:
    """Caso de uso para registrar el ingreso a una sala y devolver su estado actual."""

    def __init__(self, room_repository: RoomRepository):
        self.__room_repository = room_repository

    def execute(self, room_code: str, user_id: str, username: str) -> RoomStateDTO:
        # 1. Buscamos y validamos la sala
        room = self.__room_repository.find_by_code(room_code)
        if not room:
            raise RoomNotFoundError()

        # 2. Lógica de ingreso (Solo si es un jugador nuevo)
        if user_id not in room.players:
            room.add_human_player(user_id, username)
            self.__room_repository.update(room)

        # 4. Devolvemos la respuesta formateada y lista para React
        return RoomStateDTO.from_entity(room)