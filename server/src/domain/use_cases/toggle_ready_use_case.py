from typing import List
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.exceptions import RoomNotFoundError
from src.domain.dtos.room_dtos import RoomStateDTO, PlayerSnapshotDTO

class ToggleReadyUseCase:
    """Alterna el estado de 'Listo' de un jugador invitado en la sala."""

    def __init__(self, room_repository: RoomRepository):
        self.__room_repository = room_repository

    def execute(self, room_code: str, user_id: str) -> RoomStateDTO:
        room = self.__room_repository.find_by_code(room_code)
        if not room:
            raise RoomNotFoundError()

        # 1. Ejecutamos la regla de negocio en la entidad
        room.toggle_ready(user_id)
        
        # 2. Guardamos el cambio
        self.__room_repository.update(room)

        return RoomStateDTO.from_entity(room)