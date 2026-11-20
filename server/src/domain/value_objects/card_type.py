from enum import Enum

class CardType(Enum):
    DISASTER = "DISASTER"
    POINT = "POINT"        # Cartas que solo dan puntos (0 al 9)
    INSTANT = "INSTANT"    # Cartas con efectos inmediatos