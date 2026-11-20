from src.domain.entities.room import Room
from src.domain.dtos.room_dtos import CreateRoomResponseDTO
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.interfaces.room_code_generator import RoomCodeGenerator

class CreateRoomUseCase:
    """Caso de uso encargado de inicializar y guardar una nueva sala de juego."""

    def __init__(
        self, 
        room_repository: RoomRepository, 
        code_generator: RoomCodeGenerator
    ):
        self.__room_repository = room_repository
        self.__code_generator = code_generator

    def execute(self, host_id: str, host_username: str) -> CreateRoomResponseDTO:
        # 1. Generar un código que no exista actualmente en el repositorio
        room_code = self.__code_generator.generate()
        
        # Bucle de seguridad por si el código ya está en uso (colisión)
        while self.__room_repository.find_by_code(room_code) is not None:
            room_code = self.__code_generator.generate()

        # 2. Instanciar la Entidad de Dominio (Aquí ocurren tus validaciones internas)
        new_room = Room(
            code=room_code,
            host_id=host_id,
            host_username=host_username, # Asumimos que el username es igual al ID por simplicidad
        )

        # 3. Guardar la sala en el repositorio
        self.__room_repository.save(new_room)

        # 4. Devolver el código generado al usuario
        return CreateRoomResponseDTO(room_code=new_room.code)