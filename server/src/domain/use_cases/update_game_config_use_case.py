from typing import List
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.exceptions import RoomNotFoundError, UserNotHostError
from src.domain.dtos.room_dtos import RoomStateDTO, PlayerSnapshotDTO

class UpdateGameConfigUseCase:
    """Procesa peticiones para modificar ajustes de la sala o de la partida."""

    def __init__(self, room_repository: RoomRepository):
        self.__room_repository = room_repository

    def execute(self, room_code: str, user_id: str, payload: dict) -> RoomStateDTO:
        room = self.__room_repository.find_by_code(room_code)
        if not room:
            raise RoomNotFoundError()

        # Validación de Dominio: Solo el host toca los botones
        if room.host_id != user_id:
            raise UserNotHostError()

        # 2. Modificar ajustes del juego (la mochila)
        if "game_config" in payload:
            # Extraemos la mochila vieja y aplicamos la actualización usando kwargs (**)
            new_config = room.game_config.with_updates(**payload["game_config"])
            room.update_game_config(new_config)

        # Guardamos los cambios
        self.__room_repository.update(room)

        return RoomStateDTO.from_entity(room)