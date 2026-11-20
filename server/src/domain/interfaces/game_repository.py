from typing import List, Optional, Protocol, Tuple
from src.domain.entities.game import Game
from src.domain.entities.room import Room

class GameRepository(Protocol):

    def save(self, game: Game) -> None:
        """Guarda un nuevo juego o actualiza uno existente."""

    def find_by_room_code(self, room_code: str) -> Optional[Game]:
        """
        Busca un juego por el código de la sala al que pertenece.
        """
    def delete(self, game: Game) -> None:
        """Elimina el juego de la memoria/base de datos."""

    def update(self, game: Game) -> None:
        """Actualiza la información de un juego existente."""