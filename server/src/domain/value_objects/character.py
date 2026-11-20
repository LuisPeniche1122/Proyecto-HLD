from dataclasses import dataclass
from typing import Dict
from src.domain.value_objects.character_type import CharacterType
from src.domain.value_objects.disaster_type import DisasterType
from src.domain.value_objects.expansion_type import ExpansionType

@dataclass(frozen=True)
class Character:
    """Ficha técnica inmutable de un dinosaurio."""
    type: CharacterType
    display_name: str
    initial_traits: Dict[DisasterType, int]
    # NUEVO: Reemplazamos el is_5_6_expansion
    expansion: ExpansionType = ExpansionType.BASE