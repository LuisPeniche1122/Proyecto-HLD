from typing import List
from dataclasses import dataclass
from src.domain.value_objects.card import Card
from src.domain.value_objects.expansion_type import ExpansionType

@dataclass(frozen=True, kw_only=True)
class CardSet:
    """Un paquete de cartas listo para ser añadido al mazo."""
    expansion: ExpansionType
    is_two_player_compatible: bool 
    cards: List[Card]