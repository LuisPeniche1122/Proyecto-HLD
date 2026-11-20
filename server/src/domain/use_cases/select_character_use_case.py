from src.domain.interfaces.game_repository import GameRepository
from src.domain.dtos.game_dtos import GameStateDTO
from src.domain.value_objects.character_type import CharacterType
from src.domain.exceptions import DomainException
from src.domain.assemblers.game_state_assembler import GameStateAssembler
from src.domain.services.game_flow_service import GameFlowService # <-- Importamos el servicio

class SelectCharacterUseCase:
    def __init__(
        self, 
        game_repository: GameRepository,
        assembler: GameStateAssembler,
        game_flow_service: GameFlowService # <-- Inyectamos el servicio
    ):
        self.__game_repository = game_repository
        self.__assembler = assembler
        self.__game_flow_service = game_flow_service # <-- Lo guardamos

    def execute(self, game_id: str, user_id: str, payload: dict) -> GameStateDTO:
        game = self.__game_repository.find_by_room_code(game_id)
        if not game:
            raise DomainException("Partida no encontrada.")

        # 1. Parsear el input
        raw_char = payload.get("character_type")
        chosen_char = None if not raw_char else CharacterType(raw_char)
        
        # 2. La Entidad hace su trabajo (Validar y asignar)
        game.select_character(user_id, chosen_char)
        
        # 3. EL DIRECTOR DE ORQUESTA EN ACCIÓN:
        # Preguntamos a la entidad si ya todos eligieron
        if game.are_all_characters_selected():
            # Si sí, llamamos al Servicio de Dominio para que avance la fase
            self.__game_flow_service.finalize_character_selection(game)
            print(f"🎉 Todos eligieron. Avanzando a la fase {game.phase.value}")
        
        # 4. Guardar cambios en la DB
        self.__game_repository.update(game)

        # 5. Ensamblar respuesta
        return self.__assembler.assemble(game)