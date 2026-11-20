import random
import string
from src.domain.interfaces.room_code_generator import RoomCodeGenerator

class RandomRoomCodeGenerator(RoomCodeGenerator):
    """Generador de códigos usando pseudo-aleatoriedad nativa de Python."""

    def generate(self) -> str:
        # Crea una lista de letras mayúsculas y números
        characters = string.ascii_uppercase + string.digits
        # Selecciona 6 al azar y los une en un string
        return "".join(random.choices(characters, k=6))