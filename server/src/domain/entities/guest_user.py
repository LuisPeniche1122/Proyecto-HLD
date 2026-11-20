"""Guest User entity and factory."""
import uuid
import random
from dataclasses import dataclass

class GuestUser:
    """Represents a temporary guest in the system."""
    def __init__(self, guest_id: str, username: str):
        # 3. Por dentro, guardamos los valores en la bóveda privada.
        self.__id = guest_id
        self.__username = username
        self.__is_guest = True

    @property
    def id(self) -> str:
        return self.__id

    @property
    def username(self) -> str:
        return self.__username

    @property
    def is_guest(self) -> bool:
        return self.__is_guest

    @classmethod
    def create_random(cls) -> "GuestUser":
        """Factory method to generate a unique random guest."""
        guest_id = str(uuid.uuid4())
        
        # 1. Nuestras listas de personalidad (puedes agregar las que quieras)
        colores = ["Morado", "Azul", "Rojo", "Verde", "Amarillo", "Negro", "cyan"]
        tipos = ["Tiranosaurio Rex", "Triceratops", "Velociraptor", "Diplodocus", "Stegosaurio", "Pterodactilo", "Anquilosaurio", "Brachiosaurio", "Spinosaurio", "Allosaurio"]
        
        # 2. Seleccionamos al azar
        color = random.choice(colores)
        tipo = random.choice(tipos)
        
        # 3. Tomamos los primeros 4 caracteres del UUID
        short_hash = guest_id[:4]
        
        # Ej: "FelizRex_a7b3"
        username = f"{tipo}{color}_{short_hash}"
        
        # Retornamos la entidad instanciada
        return cls(guest_id=guest_id, username=username)