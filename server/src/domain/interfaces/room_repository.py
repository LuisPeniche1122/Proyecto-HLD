from typing import List, Optional, Protocol, Tuple
from src.domain.entities.room import Room

class RoomRepository(Protocol):

    def find_all_active_and_public(self) -> List[Tuple[Room, str]]:
        """
        Retorna las salas que no son privadas y cuyo método should_exist() sea True.
        Retorna la tupla (Entidad Room, Nombre de Usuario del Host).
        """

    def save(self, room: Room) -> None:
        """Guarda una nueva sala o actualiza una existente."""

    def find_by_code(self, room_code: str) -> Optional[Room]:
        """
        Busca una sala por su código exacto. 
        Útil para unirse a salas y para garantizar códigos únicos.
        """

    def delete(self, room_code: str) -> None:
        """Elimina la sala de la memoria/base de datos."""

    def update(self, room: Room) -> None:
        """Actualiza la información de una sala existente."""