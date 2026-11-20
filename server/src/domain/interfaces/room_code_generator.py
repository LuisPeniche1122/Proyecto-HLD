from typing import Protocol

class RoomCodeGenerator(Protocol):
    """Contrato para la generación de códigos únicos de sala."""
    
    def generate(self) -> str:
        """Genera un código alfanumérico aleatorio de 6 caracteres."""
        ...