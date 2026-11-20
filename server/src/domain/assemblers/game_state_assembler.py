from src.domain.entities.game import Game
from src.domain.interfaces.character_store import CharacterStore
from src.domain.dtos.game_dtos import GameStateDTO

class GameStateAssembler:
    """Ensamblador centralizado: Convierte la Entidad Game en un GameStateDTO listo para React."""
    
    def __init__(self, character_store: CharacterStore):
        self.__character_store = character_store

    def assemble(self, game: Game) -> GameStateDTO:
        # Extraemos las fichas técnicas pesadas del Store
        available_characters = [
            self.__character_store.get_character(char_type)
            for char_type in game.available_character_types
        ]
        
        # Le pasamos la pelota al DTO para que se construya a sí mismo
        return GameStateDTO.from_entity(game, available_characters)