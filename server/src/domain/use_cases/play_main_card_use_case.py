from src.domain.interfaces.game_repository import GameRepository
from src.domain.dtos.game_dtos import GameStateDTO
from src.domain.exceptions import DomainException
from src.domain.assemblers.game_state_assembler import GameStateAssembler
from src.domain.services.game_flow_service import GameFlowService
from src.domain.value_objects.game_phase import GamePhase

class PlayMainCardUseCase:
    def __init__(
        self, 
        game_repository: GameRepository,
        assembler: GameStateAssembler,
        game_flow_service: GameFlowService
    ):
        self.__game_repository = game_repository
        self.__assembler = assembler
        self.__game_flow_service = game_flow_service

    def execute(self, room_code: str, user_id: str, payload: dict) -> GameStateDTO:
        game = self.__game_repository.find_by_room_code(room_code)
        if not game:
            raise DomainException("Partida no encontrada.")

        raw_card_id = payload.get("card_id")
        chosen_card_id = None if not raw_card_id or raw_card_id == "" else raw_card_id
        
        # Validar fases correctas
        if game.phase not in [GamePhase.PLAY_POINT_CARDS, GamePhase.PLAY_SUDDEN_DEATH_CARDS]:
            raise DomainException("No es momento de jugar cartas boca abajo.")

        if game.phase == GamePhase.PLAY_SUDDEN_DEATH_CARDS and user_id not in game.sudden_death_players:
            raise DomainException("No estás participando en la Muerte Súbita.")

        # La Entidad anota la jugada
        game.play_main_card(user_id, chosen_card_id)
        
        # EL DIRECTOR DE ORQUESTA: Evaluar si todos ya jugaron
        if game.phase == GamePhase.PLAY_POINT_CARDS and game.are_all_main_cards_played():
            # Voltear cartas normales
            self.__game_flow_service.reveal_main_cards(game)
            
        elif game.phase == GamePhase.PLAY_SUDDEN_DEATH_CARDS and game.are_all_sudden_death_cards_played():
            # Voltear cartas de muerte súbita
            self.__game_flow_service.reveal_sudden_death_cards(game)

        self.__game_repository.update(game)
        return self.__assembler.assemble(game)