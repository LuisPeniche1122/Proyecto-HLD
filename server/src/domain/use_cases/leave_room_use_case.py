from typing import List, Optional
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.dtos.room_dtos import PlayerSnapshotDTO, RoomStateDTO
from src.domain.interfaces.user_repository import UserRepository
# Asumimos que tienes una función constructora del snapshot igual a la del JoinRoomUseCase

class LeaveRoomUseCase:
    """Maneja la desconexión de un jugador y la destrucción de salas vacías."""
    
    def __init__(self, room_repository: RoomRepository, user_repository: UserRepository):
        self.__room_repository = room_repository
        self.__user_repository = user_repository

    def execute(self, room_code: str, user_id: str) -> Optional[RoomStateDTO]:
        room = self.__room_repository.find_by_code(room_code)
        if not room:
            return None

        if user_id not in room.players:
            return None
        
        # La entidad maneja la sucesión del host o su propia muerte
        room.remove_player(user_id)

        if not room.should_exist():
            self.__room_repository.delete(room_code)
            return None # La sala murió, no hay snapshot que devolver
            
        self.__room_repository.update(room)
        
        return RoomStateDTO.from_entity(room)