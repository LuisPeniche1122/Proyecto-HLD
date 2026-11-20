from typing import List, Optional, Dict
from src.domain.value_objects.character_type import CharacterType
from src.domain.value_objects.disaster_type import DisasterType
from src.domain.value_objects.card import Card 

class GamePlayer:
    def __init__(self, user_id: str, username: str):
        self.__user_id = user_id
        self.__username = username
        self.__character_type: Optional[CharacterType] = None
        self.__victory_points: int = 0
        self.__round_score: int = 0
        
        # --- ZONAS DE CARTAS PARA LA UI ---
        self.__hand: List[Card] = []
        self.__disaster_area: List[Card] = []
        self.__sacrifice_zone: List[Card] = []
        self.__instant_zone: List[Card] = []
        self.__played_card: Optional[Card] = None

    @property
    def user_id(self) -> str: return self.__user_id
    
    @property
    def username(self) -> str: return self.__username

    @property
    def character_type(self) -> Optional[CharacterType]: return self.__character_type

    @property
    def victory_points(self) -> int: return self.__victory_points

    @property
    def round_score(self) -> int: return self.__round_score

    # Properties de las cartas
    @property
    def hand(self) -> List[Card]: return list(self.__hand)
    
    @property
    def disaster_area(self) -> List[Card]: return list(self.__disaster_area)
    
    @property
    def sacrifice_zone(self) -> List[Card]: return list(self.__sacrifice_zone)
    
    @property
    def instant_zone(self) -> List[Card]: return list(self.__instant_zone)
    
    @property
    def played_card(self) -> Optional[Card]: return self.__played_card

    def assign_character(self, char_type: CharacterType) -> None:
        self.__character_type = char_type

    def add_victory_points(self, points: int) -> None:
        self.__victory_points = max(0, self.__victory_points + points)

    def get_disaster_counts(self) -> Dict[DisasterType, int]:
        counts = {
            DisasterType.NATURAL: 0,
            DisasterType.EMOTIONAL: 0,
            DisasterType.PREDATOR: 0,
            DisasterType.METEORITE: 0
        }
        for card in self.__disaster_area:
            # Asumiendo que tu entidad Card tiene la propiedad disaster_values
            for d_type, amount in card.disaster_values.items():
                counts[d_type] += amount
        return counts
    
    def set_round_score(self, round_score):
        self.__round_score = round_score
    
    def clear_hand(self) -> List[Card]:
        """Vacía la mano del jugador y devuelve las cartas que tenía."""
        cards_to_discard = list(self.__hand) # Guardamos las cartas actuales en una nueva lista
        self.__hand.clear() # Vaciamos la zona de la mano de la UI
        return cards_to_discard
    
    def add_to_hand(self, new_card: Card):
        """Añade una carta a la mano del jugador."""
        self.__hand.append(new_card)

    def clear_used_cards(self) -> List[Card]:
        """
        Recoge todas las cartas usadas en la ronda (carta principal, instantáneas y sacrificios),
        vacía las zonas del jugador y devuelve la lista de cartas para enviarlas al descarte.
        """
        cards_to_discard: List[Card] = []
        
        # 1. Recoger la carta jugada
        if self.__played_card:
            cards_to_discard.append(self.__played_card)
            self.__played_card = None
            
        # 2. Recoger las cartas instantáneas
        if self.__instant_zone:
            cards_to_discard.extend(self.__instant_zone)
            self.__instant_zone.clear()
            
        # 3. Recoger las cartas de sacrificio (si aplica en tu lógica futura)
        if self.__sacrifice_zone:
            cards_to_discard.extend(self.__sacrifice_zone)
            self.__sacrifice_zone.clear()
            
        return cards_to_discard
    
    def clear_main_card(self) -> Optional[Card]:
        """Quita la carta jugada de la mesa y la devuelve (útil para la muerte súbita)."""
        card = self.__played_card
        self.__played_card = None
        return card
    
    def play_main_card(self, Card: Card) -> None:
        self.__played_card = Card

    def remove_from_hand(self, card: Card) -> None:
        """Elimina una carta específica de la mano del jugador."""
        if card in self.__hand:
            self.__hand.remove(card)

    def add_to_disaster_area(self, card: Card):
        self.__disaster_area.append(card)
    
    def add_to_sacrifice_zone(self, card: Card):
        self.__sacrifice_zone.append(card)