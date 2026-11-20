from src.domain.interfaces.game_repository import GameRepository
from src.domain.assemblers.game_state_assembler import GameStateAssembler
from src.domain.dtos.game_dtos import GameStateDTO
from src.domain.exceptions import DomainException

class GetGameStateUseCase:
    
    def __init__(
        self, 
        game_repository: GameRepository, 
        assembler: GameStateAssembler # <-- ¡Inyectamos el ensamblador en lugar del Store!
    ):
        self.__game_repository = game_repository
        self.__assembler = assembler

    def execute(self, room_code: str, user_id: str) -> GameStateDTO:
        game = self.__game_repository.find_by_room_code(room_code)
        if not game:
            raise DomainException("Partida no encontrada.")

        if user_id not in game.players:
            raise DomainException("No formas parte de esta partida.")
        
        # ¡Magia! Una sola línea para retornar la foto completa.
        return self.__assembler.assemble(game)