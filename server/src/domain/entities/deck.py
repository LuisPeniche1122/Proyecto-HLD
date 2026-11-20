import random
from typing import List
from src.domain.exceptions import DomainException
from src.domain.value_objects.card import Card 

class Deck:
    def __init__(self, cards: List[Card] = None):
        # Permite inicializar el mazo ya con cartas o vacío por defecto
        self.__cards: List[Card] = cards if cards is not None else []

    @property
    def remaining_cards(self) -> int:
        return len(self.__cards)

    def is_empty(self) -> bool:
        return len(self.__cards) == 0

    def shuffle(self) -> None:
        random.shuffle(self.__cards)

    def add_cards(self, cards: List[Card]) -> None:
        """Añade un grupo de cartas a la parte superior del mazo."""
        self.__cards.extend(cards)

    def add_to_top(self, card: Card) -> None:
        """Coloca una carta en la parte superior del mazo (final de la lista)."""
        self.__cards.append(card)

    def add_to_bottom(self, card: Card) -> None:
        """Coloca una carta en el fondo del mazo (inicio de la lista)."""
        self.__cards.insert(0, card)

    def draw(self) -> Card:
        """Roba y devuelve la carta de la parte superior del mazo."""
        if self.is_empty():
            raise DomainException("El mazo está vacío.")
        # pop() por defecto saca el último elemento de la lista (la parte superior)
        return self.__cards.pop()
    
    def show_top_cards(self, amount: int) -> List[Card]:
        """
        Devuelve las primeras 'amount' cartas de la parte superior del mazo SIN robarlas.
        El índice [0] de la lista devuelta será la carta de hasta arriba.
        """
        if amount <= 0 or self.is_empty():
            return []
            
        # Nos aseguramos de no pedir más cartas de las que existen
        actual_amount = min(amount, len(self.__cards))
        
        # Explicación de la magia:
        # [-actual_amount:] -> Corta la lista tomando solo las últimas cartas (las de arriba).
        # [::-1] -> Invierte ese pedacito para que la última (la de mero arriba) quede en la posición 0.
        return self.__cards[-actual_amount:][::-1]
    
    def take_all_cards(self) -> List[Card]:
        """Extrae todas las cartas del mazo dejándolo vacío y las devuelve."""
        cards_copy = list(self.__cards)
        self.__cards.clear()
        return cards_copy