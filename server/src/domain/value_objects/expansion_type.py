from enum import Enum

class ExpansionType(Enum):
    BASE = "BASE"               # Juego Original
    EXP_5_6 = "EXP_5_6"         # Expansión para 5-6 Jugadores
    PERILS = "PERILS"           # Expansión de Peligros de la Pubertad (Hazards/Perils)
    DATING = "DATING"           # Expansión de Citas (Dating)
    # Si luego metes la versión extrema, solo añades una línea aquí.