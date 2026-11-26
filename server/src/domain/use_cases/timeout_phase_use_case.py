from typing import Optional
from src.domain.entities.game import Game
from src.domain.interfaces.game_repository import GameRepository
from src.domain.assemblers.game_state_assembler import GameStateAssembler
from src.domain.dtos.game_dtos import GameStateDTO
from src.domain.value_objects.game_phase import GamePhase
from src.domain.services.game_flow_service import GameFlowService

class TimeoutPhaseUseCase:
    def __init__(self, game_repository: GameRepository, assembler: GameStateAssembler, game_flow_service: GameFlowService):
        self.__game_repository = game_repository
        self.__assembler = assembler
        self.__game_flow_service = game_flow_service
        

    def execute(self, room_code: str, expected_phase: str) -> Optional[GameStateDTO]:
        print(f"\n🔍 [DEBUG TIMEOUT] El cronómetro despertó para la sala {room_code}")
        print(f"   👉 Fase que el cronómetro esperaba encontrar: '{expected_phase}'")
        
        game = self.__game_repository.find_by_room_code(room_code)
        
        # 1. ¿El juego desapareció de la RAM?
        if not game:
            print(f"   ❌ [ABORTADO] No se encontró el juego en la base de datos.")
            return None 

        with self.__game_flow_service.synchronize(game):
            return self.__execute_locked(game, expected_phase)

    def __execute_locked(self, game: Game, expected_phase: str) -> Optional[GameStateDTO]:
        print(f"   👉 Fase real en la que está el juego ahora: '{game.phase.value}'")
        # 2. ¿El juego ya avanzó de fase gracias a un jugador manual?
        if game.phase.value != expected_phase:
            print(f"   🛑 [ABORTADO] Falsa alarma. El cronómetro es viejo. El juego ya avanzó manualmente.")
            return None 

        print(f"   ✅ [CONTINÚA] La fase coincide. Entrando al Switch (Match-Case)...")

        # ==================================================
        # ENRUTADOR DE TIMEOUTS (Switch moderno de Python)
        # ==================================================
        try:
            match game.phase:
                case GamePhase.CHARACTER_SELECTION:
                    self.__game_flow_service.finalize_character_selection(game)

                case GamePhase.INITIAL_SHUFFLE:
                    print("entramos en initial shuffle")
                    self.__game_flow_service.start_initial_shuffle(game)
                    print("salimos de initial shuffle")
                    
                case GamePhase.BEGIN_ROUND:
                    print("entramos en begin round")
                    self.__game_flow_service.begin_round(game)
                    # Aquí llamarías a la función que inicia la ronda después del shuffle
                    print("salimos de begin round")
                    
                case GamePhase.PLAY_POINT_CARDS:
                    self.__game_flow_service.reveal_main_cards(game)
                    print("salimos de reveal main")
                
                case GamePhase.CALCULATE_ROUND_SCORE:
                    self.__game_flow_service.calculate_round_scores(game)
                    print("salimos de calculate round")

                case GamePhase.RESOLVING_ROUND_WINNERS:
                    self.__game_flow_service.resolve_round_winners(game)
                    print("salimos de resolve win")

                case GamePhase.RESOLVING_ROUND_LOSERS:
                    self.__game_flow_service.resolve_round_losers(game)
                    print("salimos de resolve lose")

                case GamePhase.PLAY_SUDDEN_DEATH_CARDS:
                    self.__game_flow_service.reveal_sudden_death_cards(game)
                    print("salimos de reveal sudden")

                case GamePhase.RESOLVING_SUDDEN_DEATH:
                    self.__game_flow_service.resolve_sudden_death(game)
                    print("salimos de resolve sudden")

                case GamePhase.RESOLVING_VICTORY_POINTS:
                    self.__game_flow_service.resolve_victory_points(game)
                    print("salimos de resolve victory")
                    
                case _:
                    # El 'case _' es el 'default' del switch. 
                    # Si una fase no tiene lógica de timeout configurada, simplemente no hacemos nada.
                    print(f"⚠️ [Timeout] No hay lógica de timeout definida para la fase: {game.phase.value}")
                    return None # Retornamos None para no emitir eventos innecesarios

            # ==================================================

        # Guardamos y ensamblamos
            self.__game_repository.update(game)
            print("   💾 ¡Cambio de fase exitoso! Guardando en base de datos.")
            return self.__assembler.assemble(game)
            
        except Exception as e:
            print(f"   🔥 [ERROR FATAL] Hubo una excepción dentro del servicio: {str(e)}")
            return None