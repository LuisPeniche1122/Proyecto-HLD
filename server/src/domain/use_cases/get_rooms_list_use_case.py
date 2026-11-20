from typing import List
from src.domain.dtos.room_dtos import RoomListItemDTO
from src.domain.interfaces.room_repository import RoomRepository

class GetRoomsListUseCase:
    """Caso de uso para obtener el catálogo de salas disponibles."""

    def __init__(self, room_repository: RoomRepository):
        self.__room_repository = room_repository

    def execute(self) -> List[RoomListItemDTO]:
        active_rooms_data = self.__room_repository.find_all_active_and_public()

        rooms_list_dto: List[RoomListItemDTO] = []
        
        for room, host_username in active_rooms_data:
            # Mapeo usando las properties (@property) de la entidad
            dto = RoomListItemDTO(
                room_code=room.code, 
                host_username=host_username,
                player_count=room.total_players,
                max_players=room.max_players,
                game_config=room.game_config
            )
            rooms_list_dto.append(dto)

        return rooms_list_dto