from typing import List
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.exceptions import RoomNotFoundError, UserNotHostError, DomainException
from src.domain.dtos.room_dtos import RoomStateDTO, PlayerSnapshotDTO, ChatMessageDTO

class KickPlayerUseCase:
    def __init__(self, room_repository: RoomRepository):
        self.__room_repository = room_repository

    def execute(self, room_code: str, host_id: str, payload: dict) -> RoomStateDTO:
        room = self.__room_repository.find_by_code(room_code)
        if not room:
            raise RoomNotFoundError()

        if room.host_id != host_id:
            raise UserNotHostError("Solo el Host puede expulsar jugadores.")

        target_user_id = payload.get("target_user_id")
        if host_id == target_user_id:
            raise DomainException("No puedes expulsarte a ti mismo.")

        room.remove_player(target_user_id)
        self.__room_repository.update(room)

        return RoomStateDTO.from_entity(room)