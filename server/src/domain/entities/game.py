import random
from typing import Dict, Optional, List
from src.domain.value_objects.character_type import CharacterType
from src.domain.value_objects.disaster_type import DisasterType
from src.domain.value_objects.game_phase import GamePhase
from src.domain.value_objects.game_config import GameConfig
from src.domain.exceptions import DomainException
from src.domain.entities.game_player import GamePlayer
from src.domain.entities.deck import Deck
from src.domain.value_objects.card import Card 
from src.domain.value_objects.card_type import CardType

class Game:
    def __init__(self, room_code: str, players: Dict[str, str], config: GameConfig):
        self.__room_code = room_code
        self.__config = config
        self.__phase = GamePhase.CHARACTER_SELECTION
        self.__time_left = 0
        
        self.__players: Dict[str, GamePlayer] = {
            u_id: GamePlayer(user_id=u_id, username=u_name) 
            for u_id, u_name in players.items()
        }

        self.__tools_deck = Deck()
        self.__disasters_deck = Deck()
        self.__discard_pile = Deck()
        self.__active_disaster: Optional[Card] = None

        self.__available_character_types: List[CharacterType] = []
        self.__seating_order: List[str] = []

        self.__round_winners: List[str] = []  
        self.__round_losers: List[str] = []   
        self.__game_winner: Optional[List[str]] = None 
        self.__eliminated_players: List[str] = []
        self.__sudden_death_players: List[str] = [] 

    # ==========================================
    # PROPERTIES 
    # ==========================================
    @property
    def room_code(self) -> str: return self.__room_code
    @property
    def phase(self) -> GamePhase: return self.__phase
    @property
    def time_left(self) -> int: return self.__time_left
    @property
    def config(self) -> GameConfig: return self.__config
    @property
    def players(self) -> Dict[str, GamePlayer]: return dict(self.__players)
    @property
    def selections(self) -> Dict[str, Optional[CharacterType]]: 
        return {uid: player.character_type for uid, player in self.__players.items()}
    @property
    def seating_order(self) -> List[str]: return list(self.__seating_order)
    @property
    def active_disaster(self) -> Optional[Card]: return self.__active_disaster
    @property
    def tools_deck_count(self) -> int: return self.__tools_deck.remaining_cards
    @property
    def disasters_deck_count(self) -> int: return self.__disasters_deck.remaining_cards
    @property
    def discard_pile_count(self) -> int: return self.__discard_pile.remaining_cards
    @property
    def top_discard_card(self) -> Optional[Card]: 
        top_cards = self.__discard_pile.show_top_cards(1)
        return top_cards[0] if top_cards else None
    @property
    def available_character_types(self) -> List[CharacterType]: return list(self.__available_character_types)

    @property
    def round_winners(self) -> List[str]: return list(self.__round_winners)
    @property
    def round_losers(self) -> List[str]: return list(self.__round_losers)
    @property
    def game_winner(self) -> Optional[str]: return self.__game_winner
    @property
    def eliminated_players(self) -> List[str]: return list(self.__eliminated_players)
    
    # NUEVO: Propiedades solicitadas
    @property
    def sudden_death_players(self) -> List[str]: return list(self.__sudden_death_players)
    
    @property
    def alive_players(self) -> List[GamePlayer]: 
        """Helper para obtener a los jugadores que siguen vivos en la partida."""
        return [p for p in self.__players.values() if p.user_id not in self.__eliminated_players]

    # ==========================================
    # MUTADORES DE ESTADO (Para que el Servicio los use)
    # ==========================================
    def transition_to_phase(self, new_phase: GamePhase, time_left: int) -> None:
        self.__phase = new_phase
        self.__time_left = time_left

    def set_available_characters(self, chars: List[CharacterType]) -> None:
        self.__available_character_types = chars

    def generate_seating_order(self) -> None:
        self.__seating_order = list(self.__players.keys())
        random.shuffle(self.__seating_order)

    def set_round_results(self, winners: List[str], losers: List[str]) -> None:
        self.__round_winners = winners
        self.__round_losers = losers

    def set_game_winner(self, user_id: str) -> None:
        self.__game_winner = user_id
        
    def eliminate_player(self, user_id: str) -> None:
        if user_id not in self.__eliminated_players:
            # 1. Lo marcamos como eliminado
            self.__eliminated_players.append(user_id)
            
            # 2. Obtenemos la entidad del jugador
            player = self.__players[user_id]
            
            # 3. Recogemos todas sus cartas (mano y mesa)
            cards_to_discard = []
            cards_to_discard.extend(player.clear_hand())
            cards_to_discard.extend(player.clear_used_cards())
            
            # 4. Las enviamos a la pila de descarte general
            if cards_to_discard:
                self.discard_cards(cards_to_discard)
                
            # Opcional: Podrías hacer un print o log aquí para debuggear
            # print(f"Jugador {player.username} eliminado. {len(cards_to_discard)} cartas devueltas al descarte."
            
    def set_sudden_death_players(self, players: List[str]) -> None:
        self.__sudden_death_players = players

    def give_disaster_to_player(self, user_id: str) -> None:
        """Pasa el desastre activo a la zona de desastres del jugador."""
        if self.__active_disaster:
            self.__players[user_id].add_to_disaster_area(self.__active_disaster)
            self.__active_disaster = None

    def reset_round_data(self) -> None:
        """Limpia los datos temporales de la ronda anterior para iniciar una limpia."""
        self.__round_winners.clear()
        self.__round_losers.clear()
        self.__sudden_death_players.clear()
        
        for player in self.__players.values():
            # Resetear puntaje de ronda
            player.set_round_score(0)
            
            # Limpiar la mesa de las cartas jugadas (pasarlas a descarte)
            used_cards = player.clear_used_cards()
            if used_cards:
                self.discard_cards(used_cards)

    def reset_for_sudden_death(self) -> None:
        """Limpia las cartas de los jugadores en muerte súbita para que puedan seguir poniendo."""
        
        for user_id in self.__sudden_death_players:
            player = self.__players[user_id]
            
            # Limpiar la mesa de la carta jugada y pasarla a la zona de sacrificio
            main_card = player.clear_main_card()  # ¡Importante agregar los () aquí!
            
            if main_card:
                player.add_to_sacrifice_zone(main_card)

    def return_active_disaster_to_deck(self) -> None:
        """Envía el desastre activo al mazo de desastres (abajo o arriba, según tu Deck) y lo limpia de la mesa."""
        if self.__active_disaster:
            self.__disasters_deck.add_to_bottom(self.__active_disaster)
            self.__active_disaster = None

    def add_to_tools_deck(self, cards: List[Card]) -> None: self.__tools_deck.add_cards(cards)
    def shuffle_tools_deck(self) -> None: self.__tools_deck.shuffle()
    def add_to_disasters_deck(self, cards: List[Card]) -> None: self.__disasters_deck.add_cards(cards)
    def shuffle_disasters_deck(self) -> None: self.__disasters_deck.shuffle()
    def draw_disaster(self) -> None: self.__active_disaster = self.__disasters_deck.draw()

    # ==========================================
    # LÓGICA DE NEGOCIO INTERNA
    # ==========================================
    def select_character(self, user_id: str, char_type: Optional[CharacterType]) -> None:
        # Quitamos la validación de la fase y el "finalize", eso lo hará el caso de uso / servicio
        if user_id not in self.__players:
            raise DomainException("El usuario no pertenece a esta partida.")

        player = self.__players[user_id]
        if char_type is None:
            player.assign_character(None)
            return
        
        if char_type == CharacterType.RANDOM:
            player.assign_character(CharacterType.RANDOM)
        else:
            if char_type not in self.__available_character_types:
                raise DomainException("Ese personaje no está habilitado en esta configuración.")
            
            is_taken = any(p.character_type == char_type for p in self.__players.values() if p.user_id != user_id)
            if is_taken:
                raise DomainException("Ese personaje ya fue elegido.")
            
            player.assign_character(char_type)

    def are_all_characters_selected(self) -> bool:
        """Helper para que el servicio sepa si todos ya eligieron."""
        return all(p.character_type is not None for p in self.__players.values())
    
    def play_main_card(self, user_id: str, card_id: Optional[str]) -> None:
        """Permite al jugador seleccionar o deseleccionar su carta principal (boca abajo)."""
        if user_id not in self.__players:
            raise DomainException("El usuario no pertenece a esta partida.")

        player = self.__players[user_id]

        # Caso 1: Deseleccionar carta (Mandó un None o string vacío)
        if not card_id:
            if player.played_card:
                # Devolver la carta jugada a la mano
                player.add_to_hand(player.played_card)
                player.play_main_card(None)
            return

        # Caso 2: Seleccionar una nueva carta
        # Buscar la carta en la mano
        card_to_play = next((c for c in player.hand if c.instance_id == card_id), None)
        if not card_to_play:
            raise DomainException("La carta seleccionada no está en tu mano.")

        # Validar que no sea Instantánea (Las instantáneas tienen su propio flujo)
        if card_to_play.type == CardType.INSTANT:
            raise DomainException("No puedes jugar una carta instantánea boca abajo.")

        # Si el jugador ya tenía una carta seleccionada previamente, se la devolvemos a la mano
        if player.played_card:
            player.add_to_hand(player.played_card)
            player.play_main_card(None)

        # Quitamos la nueva carta de la mano y la asignamos a su slot en la mesa
        player.remove_from_hand(card_to_play)
        player.play_main_card(card_to_play)

    def are_all_main_cards_played(self) -> bool:
        """Helper para que el servicio o UseCase sepa si todos ya jugaron su carta boca abajo."""
        return all(p.played_card is not None for p in self.__players.values())

    def discard_cards(self, cards: List[Card]) -> None:
        self.__discard_pile.add_cards(cards)

    def refill_tools_deck(self) -> None:
        discarded_cards = self.__discard_pile.take_all_cards()
        self.__tools_deck.add_cards(discarded_cards)
        self.__tools_deck.shuffle()

    def refill_hands(self) -> None:
        total_needed = sum(5 - len(player.hand) for player in self.__players.values())
        if total_needed == 0: return
        if total_needed > self.__tools_deck.remaining_cards:
            self.refill_tools_deck()
            
        for player in self.__players.values():
            cards_needed = 5 - len(player.hand)
            for _ in range(cards_needed):
                if not self.__tools_deck.is_empty():
                    player.add_to_hand(self.__tools_deck.draw())

    def verify_instant_hands(self) -> None:
        for player in self.__players.values():
            while len(player.hand) == 5 and all(card.type == CardType.INSTANT for card in player.hand):
                bad_hand = player.clear_hand()
                self.discard_cards(bad_hand)
                self.refill_hands()

    def check_if_player_lost(self, user_id: str) -> bool:
        player = self.__players[user_id]
        counts = player.get_disaster_counts()
        is_two_player = len(self.__players) == 2
        limit_same = 4 if is_two_player else 3
        limit_each = 2 if is_two_player else 1
        
        basic_types = [DisasterType.NATURAL, DisasterType.EMOTIONAL, DisasterType.PREDATOR]
        for d_type in basic_types:
            if counts[d_type] >= limit_same: return True

        has_all_types = all(counts[d_type] >= limit_each for d_type in basic_types)
        return has_all_types

    def are_all_sudden_death_cards_played(self) -> bool:
        """Verifica si ÚNICAMENTE los jugadores en Muerte Súbita ya pusieron su carta."""
        return all(self.__players[uid].played_card is not None for uid in self.__sudden_death_players)

    def get_players_without_valid_cards(self, user_ids: List[str]) -> List[str]:
        """Devuelve los IDs de los jugadores que no tienen cartas de puntos en su mano."""
        invalid_players = []
        for uid in user_ids:
            player = self.__players[uid]
            # Tiene cartas válidas si hay al menos 1 que NO sea Instantánea
            has_valid = any(card.type != CardType.INSTANT for card in player.hand)
            if not has_valid:
                invalid_players.append(uid)
        return invalid_players