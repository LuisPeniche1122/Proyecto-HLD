import re
from typing import Set, Dict, List
from src.domain.exceptions import DomainException, RoomFullError, UserAlreadyInRoomError, UserNotInRoomError
from src.domain.value_objects.game_config import GameConfig
from src.domain.value_objects.room_phase import RoomPhase

class Room:
    """Entidad principal que representa una sala de juego interactiva."""
    
    def __init__(
        self, 
        code: str, 
        host_id: str, 
        host_username: str
    ):
        self.__code: str = self.__validate_room_code(code)
        
        # Puntero al jefe de la sala
        self.__host_id: str = host_id
        
        # Diccionario unificado: { "user_id": "username" }
        # Al inicializar, metemos al host como el primer jugador
        self.__players: Dict[str, str] = {host_id: host_username} 
        
        self.__bot_ids: Set[str] = set()
        self.__max_players: int = 4
        self.__is_private: bool = False
        self.__room_phase: RoomPhase = RoomPhase.LOBBY # Podría ser "lobby", "in_game", "post_game", etc.
        self.__chat_history: List[Dict[str, str]] = []
        self.__game_config: GameConfig = GameConfig()
        self.__ready_player_ids: Set[str] = set()

    # --- GETTERS ---
    @property
    def game_config(self) -> GameConfig:
        return self.__game_config

    @property
    def code(self) -> str:
        return self.__code

    @property
    def host_id(self) -> str:
        return self.__host_id
    
    @property
    def host_username(self) -> str:
        # Obtenemos el nombre del host directamente del diccionario
        return self.__players.get(self.__host_id, "Host Desconocido")

    @property
    def max_players(self) -> int:
        return self.__max_players

    @property
    def is_private(self) -> bool:
        return self.__is_private
    
    @property
    def room_phase(self) -> RoomPhase:
        return self.__room_phase

    @property
    def total_players(self) -> int:
        return len(self.__players) + len(self.__bot_ids)
    
    @property
    def players(self) -> Dict[str, str]:
        """Retorna una copia del diccionario de jugadores."""
        return dict(self.__players)
    
    @property
    def ready_player_ids(self) -> Set[str]:
        """Retorna una copia del set de jugadores listos."""
        return set(self.__ready_player_ids)
    
    @property
    def bot_ids(self) -> Set[str]:
        """Retorna una copia del set de bots."""
        return set(self.__bot_ids)
    
    @property
    def chat_history(self) -> List[Dict[str, str]]:
        """Retorna una copia del historial de chat."""
        return list(self.__chat_history)
    
    def num_players(self) -> int:
        return len(self.__players)
    
    def restore_state(
        self, players: Dict[str, str],
        bot_ids: List[str],
        privacy: bool,
        room_phase: RoomPhase,
        max_players: int,
        ready_player_ids: List[str] = None,
        game_config: GameConfig = None,
        chat_history: List[Dict[str, str]] = None
        ) -> None:
        """Restaura el estado interno exacto desde la base de datos sin romper encapsulamiento."""
        self.__players = players.copy()
        self.__bot_ids = set(bot_ids)
        self.__is_private = privacy
        self.__room_phase = room_phase
        self.__max_players = max_players
        self.__ready_player_ids = set(ready_player_ids) if ready_player_ids is not None else set()
        if game_config:
            self.__game_config = game_config
        self.__chat_history = list(chat_history) if chat_history is not None else []

    # --- VALIDACIONES PRIVADAS ---
    def __validate_room_code(self, code: str) -> str:
        if len(code) != 6 or not re.match(r"^[A-Z0-9]{6}$", code):
            raise DomainException("El código de la sala debe tener exactamente 6 caracteres alfanuméricos.")
        return code

    def __validate_player_limits(self, max_players: int = None) -> None:
        if max_players < 2 or max_players > 6:
            raise DomainException("Una sala debe permitir entre 2 y 6 jugadores.")

    # --- REGLAS DE NEGOCIO ---
    
    def add_human_player(self, player_id: str, username: str) -> None:
        if self.is_full():
            raise RoomFullError()
        if player_id in self.__players:
            raise UserAlreadyInRoomError()
            
        # Agregamos al nuevo jugador al diccionario
        self.__players[player_id] = username
        self.__enforce_expansion_rule()

    def toggle_ready(self, player_id: str) -> None:
        """Alterna el estado de 'Listo' de un jugador."""
        if player_id not in self.__players:
            raise UserNotInRoomError()
            
        if player_id == self.__host_id:
            # Regla de negocio: El host no necesita ponerse listo
            return 
            
        # Si ya estaba listo, se lo quitamos. Si no estaba, se lo ponemos.
        if player_id in self.__ready_player_ids:
            self.__ready_player_ids.remove(player_id)
        else:
            self.__ready_player_ids.add(player_id)

    def change_phase(self, new_phase: str) -> None:
        """Cambia la fase de la sala (ej. de 'LOBBY' a 'PLAYING')."""
        self.__room_phase = new_phase

    def add_bot(self, bot_id: str) -> None:
        if self.is_full():
            raise RoomFullError()
        self.__bot_ids.add(bot_id)
        self.__enforce_expansion_rule()

    def change_host(self, new_host_id: str) -> None:
        if new_host_id not in self.__players:
            raise DomainException("El nuevo host debe ser un jugador humano actualmente en la sala.")
        self.__host_id = new_host_id

    def remove_player(self, player_id: str) -> None:
        if player_id in self.__bot_ids:
            self.__bot_ids.remove(player_id)
            self.__enforce_expansion_rule()
            
        elif player_id in self.__players:
            del self.__players[player_id]
            self.__ready_player_ids.discard(player_id)
            
            # Si el que se fue era el host, buscamos sucesor
            if player_id == self.__host_id:
                if self.__players:
                    # Coronamos al siguiente jugador disponible en el diccionario
                    self.__host_id = next(iter(self.__players))
                else:
                    # La sala quedó vacía
                    self.__host_id = None
            self.__enforce_expansion_rule()
        else:
            raise UserNotInRoomError()
        
    def update_max_players(self, new_limit: int) -> None:
        """Si cambian el límite, validamos y aplicamos reglas colaterales."""
        self.__validate_player_limits(new_limit)
        self.__max_players = new_limit
        
    def update_game_config(self, new_config: GameConfig) -> None:
        """Reemplaza la mochila entera."""
        self.__game_config = new_config
        self.__enforce_expansion_rule() # Por si intentaron desactivarla haciendo trampa

    def update_privacy(self, is_private: bool) -> None:
        self.__is_private = is_private

    def add_chat_message(self, username: str, text: str) -> None:
        """Agrega un mensaje y borra el más viejo si excede el límite de memoria."""
        self.__chat_history.append({"user": username, "text": text})
        if len(self.__chat_history) > 50:
            self.__chat_history.pop(0)

    def __enforce_expansion_rule(self) -> None:
        """REGLA INVARIANTE: Si hay 5 o 6 jugadores, la expansión DEBE estar activa."""
        needs_expansion = self.total_players > 4
        
        if self.__game_config.use_5_6_expansion != needs_expansion:
            # Como es inmutable, creamos uno nuevo con el update
            self.__game_config = self.__game_config.with_updates(use_5_6_expansion=needs_expansion)
    
    def is_full(self) -> bool:
        return self.total_players >= self.__max_players

    def should_exist(self) -> bool:
        return self.__host_id is not None
    
    def should_be_listed(self) -> bool:
        return (not self.__is_private) and (not self.is_full())