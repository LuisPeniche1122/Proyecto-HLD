from typing import List, Protocol
from src.domain.value_objects.character import Character
from src.domain.value_objects.character_type import CharacterType

class CharacterStore(Protocol):
    """Interfaz (Contrato) para el catálogo de personajes del juego."""
    
    def get_character(self, char_type: CharacterType) -> Character:
        """Obtiene la ficha técnica de un personaje específico."""
        ...

    def get_all_characters(self) -> List[Character]:
        """Obtiene la lista completa de personajes disponibles."""
        ...