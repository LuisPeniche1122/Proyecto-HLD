from src.domain.entities.game import Game
from src.domain.interfaces.game_repository import GameRepository
from src.domain.interfaces.room_repository import RoomRepository
from src.domain.interfaces.character_store import CharacterStore 
from src.domain.interfaces.card_set_store import CardSetStore
from src.domain.exceptions import RoomNotFoundError, UserNotHostError, DomainException
from src.domain.dtos.room_dtos import RoomStateDTO
from src.domain.value_objects.room_phase import RoomPhase
from src.domain.services.game_flow_service import GameFlowService # <-- IMPORTAMOS EL SERVICIO

class StartGameUseCase:
    
    def __init__(
        self, 
        room_repository: RoomRepository, 
        game_repository: GameRepository,
        character_store: CharacterStore,
        card_set_store: CardSetStore,
        game_flow_service: GameFlowService # <-- LO INYECTAMOS AQUÍ
    ):
        self.__room_repository = room_repository
        self.__game_repository = game_repository
        self.__character_store = character_store
        self.__card_set_store = card_set_store
        self.__game_flow_service = game_flow_service # <-- LO GUARDAMOS

    def execute(self, room_code: str, host_id: str) -> RoomStateDTO:
        room = self.__room_repository.find_by_code(room_code)
        if not room:
            raise RoomNotFoundError()

        if room.host_id != host_id:
            raise UserNotHostError("Solo el Host puede iniciar la partida.")

        if room.num_players() < 2:
            raise DomainException("Faltan jugadores para iniciar la partida.")
            
        guests = [p_id for p_id in room.players.keys() if p_id != room.host_id]
        if not all(g_id in room.ready_player_ids for g_id in guests):
            raise DomainException("No todos los jugadores están listos.")

        # 1. Creamos la entidad en blanco
        new_game = Game(
            room_code=room.code,
            players=room.players,
            config=room.game_config
        )
        
        # 2. Obtenemos los catálogos
        all_chars = self.__character_store.get_all_characters()
        tools_cards_sets = self.__card_set_store.get_tools_sets()
        disasters_card_Sets = self.__card_set_store.get_disasters_sets()
        
        # 3. EL CRUPIER (Servicio) PREPARA LA MESA
        self.__game_flow_service.setup_game(
            game=new_game,
            all_characters=all_chars, 
            tools_sets=tools_cards_sets, 
            disasters_sets=disasters_card_Sets
        ) 

        # 4. Guardar la partida en la DB
        self.__game_repository.save(new_game)

        # 5. Cambiar el estado del Lobby a "Jugando"
        room.change_phase(RoomPhase.PLAYING) 
        self.__room_repository.update(room)
        
        return RoomStateDTO.from_entity(room)