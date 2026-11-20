from typing import Optional, Dict
from dataclasses import dataclass
from src.domain.value_objects.card_type import CardType
from src.domain.value_objects.disaster_type import DisasterType

@dataclass(frozen=True, kw_only=True)
class Card:
    card_id: str       # Template ID (ej. "point_stick_2")
    instance_id: str   # ID único físico (ej. "point_stick_2_001")
    type: CardType
    effect_code: Optional[str] = None

@dataclass(frozen=True, kw_only=True)
class DisasterCard(Card):
    disaster_values: Dict[DisasterType, int]

@dataclass(frozen=True, kw_only=True)
class PointCard(Card):
    value: int

@dataclass(frozen=True, kw_only=True)
class InstantCard(Card):
    pass