from typing import List, Protocol
from src.domain.value_objects.card_set import CardSet

class CardSetStore(Protocol):
    """Contrato para la fábrica que proporciona los paquetes de cartas."""
    
    def get_tools_sets(self) -> List[CardSet]:
        """Obtiene todos los sub-mazos disponibles para herramientas/puntos."""
        ...

    def get_disasters_sets(self) -> List[CardSet]:
        """Obtiene todos los sub-mazos disponibles para desastres."""
        ...