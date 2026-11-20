from typing import List, Tuple, Dict, Optional
from src.domain.entities.room import Room
from src.domain.interfaces.room_repository import RoomRepository

class InMemoryRoomRepository(RoomRepository):
    """Implementación en memoria del repositorio de salas guardando Entidades directamente."""

    def __init__(self):
        # Base de datos simulada. Llave: room_code, Valor: Entidad Room viva
        self.__rooms_collection: Dict[str, Room] = {}

    def find_all_active_and_public(self) -> List[Tuple[Room, str]]:
        active_public_rooms = []
        
        # Iteramos directamente sobre las Entidades guardadas
        for room in self.__rooms_collection.values():
            if room.should_be_listed():
                host_username = room.host_username
                active_public_rooms.append((room, host_username))
                
        return active_public_rooms
    
    def find_by_code(self, room_code: str) -> Optional[Room]:
        """Busca una sala por su código exacto."""
        # Como no hay documentos crudos, simplemente retornamos el objeto que saca el get()
        return self.__rooms_collection.get(room_code)

    def save(self, room: Room) -> None:
        """Guarda la entidad viva directamente en la memoria."""
        self.__rooms_collection[room.code] = room

    def delete(self, room_code: str) -> None:
        """Elimina la sala de la memoria/base de datos."""
        if room_code in self.__rooms_collection:
            del self.__rooms_collection[room_code]

    def update(self, room: Room) -> None:
        """Actualiza la información de una sala existente."""
        if room.code not in self.__rooms_collection:
            raise ValueError(f"Intento de actualizar la sala {room.code} que no existe.")
        
        # Aunque los objetos mutan por referencia en RAM, aseguramos la asignación 
        # para cumplir el contrato del repositorio.
        self.__rooms_collection[room.code] = room