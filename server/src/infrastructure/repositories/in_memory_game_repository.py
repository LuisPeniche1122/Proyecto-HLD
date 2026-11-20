from typing import Dict, Optional
from src.domain.entities.game import Game
from src.domain.interfaces.game_repository import GameRepository

class InMemoryGameRepository(GameRepository):
    """Implementación en memoria (RAM) para persistir las partidas en curso."""
    
    def __init__(self):
        # Diccionario maestro: { "room_code": Game }
        self.__games: Dict[str, Game] = {}

    def save(self, game: Game) -> None:
        """Guarda un nuevo juego en el diccionario."""
        self.__games[game.room_code] = game

    def find_by_room_code(self, room_code: str) -> Optional[Game]:
        """Busca y retorna la partida si existe."""
        return self.__games.get(room_code)

    def update(self, game: Game) -> None:
        """En memoria, actualizar es sobrescribir la llave con el estado más reciente."""
        self.__games[game.room_code] = game

    def delete(self, game: Game) -> None:
        """Elimina la partida de la memoria."""
        if game.room_code in self.__games:
            del self.__games[game.room_code]