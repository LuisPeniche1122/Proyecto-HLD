import random
from typing import List, Dict
from src.domain.entities.game import Game
from src.domain.value_objects.character import Character
from src.domain.value_objects.card_set import CardSet
from src.domain.value_objects.character_type import CharacterType
from src.domain.value_objects.game_phase import GamePhase
from src.domain.exceptions import DomainException
from src.domain.value_objects.card import PointCard, DisasterCard
from src.domain.interfaces.character_store import CharacterStore
from src.domain.value_objects.card_type import CardType

class GameFlowService:
    """Servicio de Dominio responsable de orquestar el flujo y las fases de un juego."""
    def __init__(self, character_store : CharacterStore):
        self.__character_store = character_store

    def setup_game(
        self, 
        game: Game, 
        all_characters: List[Character], 
        tools_sets: List[CardSet], 
        disasters_sets: List[CardSet]
    ) -> None:
        is_two_player = len(game.players) == 2

        # 1. Filtro de Personajes
        available_chars = [c.type for c in all_characters if c.expansion in game.config.enabled_expansions]
        if len(game.players) > len(available_chars):
            raise DomainException("No hay suficientes personajes disponibles.")
        game.set_available_characters(available_chars)

        # 2. Sentar jugadores
        game.generate_seating_order()

        # 3. Mazo Principal
        for card_set in tools_sets:
            if card_set.expansion not in game.config.enabled_expansions: continue
            if is_two_player and not card_set.is_two_player_compatible: continue
            game.add_to_tools_deck(card_set.cards)
        game.shuffle_tools_deck()

        # 4. Mazo Desastres
        for card_set in disasters_sets:
            if card_set.expansion in game.config.enabled_expansions:
                game.add_to_disasters_deck(card_set.cards)
        game.shuffle_disasters_deck()

        # 5. Iniciar Fase
        game.transition_to_phase(GamePhase.CHARACTER_SELECTION, time_left=30)

    def finalize_character_selection(self, game: Game) -> None:
        if game.phase != GamePhase.CHARACTER_SELECTION:
            return 
            
        manual_selections = [
            p.character_type for p in game.players.values()
            if p.character_type is not None and p.character_type != CharacterType.RANDOM
        ]
        
        remaining_types = [t for t in game.available_character_types if t not in manual_selections]
        random.shuffle(remaining_types)
        
        for player in game.players.values():
            if player.character_type is None or player.character_type == CharacterType.RANDOM:
                if remaining_types:
                    # Accedemos directo al método de Game para forzar la selección
                    game.select_character(player.user_id, remaining_types.pop(0))
                else:
                    raise DomainException("No hay personajes disponibles.")
                    
        game.transition_to_phase(GamePhase.INITIAL_SHUFFLE, time_left=4)

    def start_initial_shuffle(self, game: Game) -> None:
        if game.phase != GamePhase.INITIAL_SHUFFLE:
            return

        game.shuffle_tools_deck()
        game.shuffle_disasters_deck()
        game.transition_to_phase(GamePhase.BEGIN_ROUND, time_left=1)

    def begin_round(self, game: Game) -> None:
        if game.phase != GamePhase.BEGIN_ROUND:
            return
            
        game.refill_hands()
        game.draw_disaster()
        game.verify_instant_hands()
        
        # Leemos el tiempo dinámico de la configuración de esa partida
        game.transition_to_phase(GamePhase.PLAY_POINT_CARDS, time_left=game.config.select_card_phase_timer)

    def reveal_main_cards(self, game: Game) -> None:
        """
        Avanzamos a la fase de resolución de efectos.
        Si se llamó por timeout y alguien no eligió, se le asigna una carta aleatoria.
        Al salir de la fase PLAY_TOOL_CARDS, el DTO mostrará los frentes reales automáticamente.
        """
        if game.phase != GamePhase.PLAY_POINT_CARDS:
            return
            
        # 1. AUTO-PLAY PARA REZAGADOS (Por si se acabó el tiempo)
        for player in game.players.values():
            if player.played_card is None:
                # Buscamos las cartas válidas en su mano (descartamos las INSTANT)
                valid_cards = [card for card in player.hand if card.type != CardType.INSTANT]
                
                if valid_cards:
                    random_card = random.choice(valid_cards)
                    # Usamos la misma función de la Entidad para asegurar que se quita de la mano 
                    # y se pone en la mesa correctamente
                    game.play_main_card(player.user_id, random_card.instance_id)

        # 2. Cambiamos de fase (esto dispara que el DTO deje de censurar las cartas)
        game.transition_to_phase(GamePhase.CALCULATE_ROUND_SCORE, time_left=1)


    def calculate_round_scores(self, game: Game) -> None:
        """
        Calcula el puntaje final de la ronda para cada jugador y define a los ganadores y perdedores.
        """
        active_disaster_types = []
        if game.active_disaster and isinstance(game.active_disaster, DisasterCard):
            active_disaster_types = list(game.active_disaster.disaster_values.keys())

        for player_id, player in game.players.items():
            current_round_score = 0

            # --- A. VALOR DE LA CARTA ---
            if player.played_card and isinstance(player.played_card, PointCard):
                current_round_score += player.played_card.value

            # --- B. INSTANTÁNEAS ---
            for instant in player.instant_zone:
                if instant.card_id == "inst_score_booster":
                    current_round_score += 2
                elif instant.card_id == "inst_score_sapper":
                    current_round_score -= 2

            # --- C. TRAITS DEL DINO ---
            if player.character_type:
                character = self.__character_store.get_character(player.character_type)
                if character:
                    for d_type in active_disaster_types:
                        if d_type in character.initial_traits:
                            current_round_score += character.initial_traits[d_type]

            player.set_round_score(current_round_score)

        # --- D. DEFINIR GANADORES Y PERDEDORES ---
        alive_players = game.alive_players
        if not alive_players:
            return

        max_score = max(p.round_score for p in alive_players)
        min_score = min(p.round_score for p in alive_players)

        round_winners = [p.user_id for p in alive_players if p.round_score == max_score]
        round_losers = [p.user_id for p in alive_players if p.round_score == min_score]
        print("round winners", round_winners)
        print("round loosers", round_losers)

        game.set_round_results(winners=round_winners, losers=round_losers)
        game.transition_to_phase(GamePhase.RESOLVING_ROUND_WINNERS, time_left=1)

    def resolve_round_winners(self, game: Game) -> None:
        """
        Fase: RESOLVING_ROUND_WINNERS
        Suma puntos, verifica el Game Over, y decide si vamos a Perdedores o Muerte Súbita.
        """
        if game.phase != GamePhase.RESOLVING_ROUND_WINNERS:
            return

        alive_players = game.alive_players
        if not alive_players:
            return

        # EMPATE TOTAL
        if len(game.round_winners) == len(alive_players):
            print("todos ganaron, hay que hacer otra ronda")
            game.return_active_disaster_to_deck()
            print("se ha devuelto el desastre al mazo de desastres")
            game.reset_round_data()
            print("se resetearon las zonas")
            game.transition_to_phase(GamePhase.BEGIN_ROUND, time_left=1)
            return

        # HAY GANADORES CLAROS
        game_over = False
        max_victory_points = 0
        
        for winner_id in game.round_winners:
            player = game.players[winner_id]
            player.add_victory_points(player.round_score)
            
            if player.victory_points >= 50:
                if player.victory_points > max_victory_points:
                    game.set_game_winner(winner_id)
                    max_victory_points = player.victory_points
                game_over = True

        if game_over:
            game.transition_to_phase(GamePhase.GAME_OVER, time_left=1)
            return

        # CASO C: EVALUAR PERDEDORES Y MUERTE SÚBITA
        if len(game.round_losers) > 1:
            out_of_cards = game.get_players_without_valid_cards(game.round_losers)
            if out_of_cards:
                if len(out_of_cards) > 1:
                    # Todos se quedaron sin cartas empatados. Empate total técnico.
                    print("hay mas de 1 jugador sin cartas para jugar, se reinicia la ronda")
                    game.return_active_disaster_to_deck()
                    print("se retira el desastre")
                    game.reset_round_data()
                    print("se resetean las zonas")
                    game.transition_to_phase(GamePhase.BEGIN_ROUND, time_left=1)
                else:
                    # Solo uno se quedó sin cartas, pierde por default.
                    print("solo uno se quedó sin cartas, lo ponemos como perdedor directo")
                    print(game.round_losers)
                    game.set_round_results(winners=game.round_winners, losers=out_of_cards)
                    print(game.round_losers)
                    game.transition_to_phase(GamePhase.RESOLVING_ROUND_LOSERS, time_left=5)
            else:
                # Todos tienen cartas, iniciamos la selección de muerte súbita
                print("varios perdieron y todos tienen cartas, amonos pa la muerte súbita")
                game.set_sudden_death_players(game.round_losers)
                game.reset_for_sudden_death()
                game.transition_to_phase(GamePhase.PLAY_SUDDEN_DEATH_CARDS, time_left=game.config.select_card_phase_timer)
        else:
            # Solo un perdedor
            print("solo uno perdió, no problemo")
            game.transition_to_phase(GamePhase.RESOLVING_ROUND_LOSERS, time_left=5)

    def reveal_sudden_death_cards(self, game: Game) -> None:
        """
        [Llamado por el UseCase o el Timer]
        Todos los empatados jugaron o se acabó el tiempo. Cambia de fase para que el Front anime las cartas volteándose.
        """
        if game.phase != GamePhase.PLAY_SUDDEN_DEATH_CARDS:
            return

        for uid in game.sudden_death_players:
            player = game.players[uid]
            if player.played_card is None:
                valid_cards = [c for c in player.hand if c.type != CardType.INSTANT]
                if valid_cards:
                    game.play_main_card(uid, random.choice(valid_cards).instance_id)

        # Transición a la fase de animación para que se vean las cartas (El DTO dejará de censurar)
        game.transition_to_phase(GamePhase.RESOLVING_SUDDEN_DEATH, time_left=game.config.select_card_phase_timer)


    def resolve_sudden_death(self, game: Game) -> None:
        """
        [Llamado ÚNICAMENTE por el TimerManager cuando RESOLVING_SUDDEN_DEATH llega a 0]
        Calcula quién perdió la muerte súbita y limpia la mesa.
        """
        if game.phase != GamePhase.RESOLVING_SUDDEN_DEATH:
            return

        sudden_death_scores = {}
        for uid in game.sudden_death_players:
            player = game.players[uid]
            if player.played_card and hasattr(player.played_card, 'value'):
                sudden_death_scores[uid] = player.played_card.value
            else:
                sudden_death_scores[uid] = -999 

        min_score = min(sudden_death_scores.values())
        new_losers = [uid for uid, score in sudden_death_scores.items() if score == min_score]

        # Limpiar las cartas jugadas y mandarlas al descarte
        for uid in game.sudden_death_players:
            card = game.players[uid].clear_main_card()
            if card: 
                game.discard_cards([card])

        # Evaluar
        if len(new_losers) == 1:
            # Perdedor definitivo
            game.set_round_results(winners=game.round_winners, losers=new_losers)
            game.set_sudden_death_players([]) 
            game.transition_to_phase(GamePhase.RESOLVING_ROUND_LOSERS, time_left=5)
            
        else:
            # Siguen empatados. Verificamos si se quedaron sin cartas.
            players_out_of_cards = game.get_players_without_valid_cards(new_losers)
            
            if players_out_of_cards:
                if len(players_out_of_cards) > 1:
                    # Todos se quedaron sin cartas. Se cancela la ronda.
                    game.return_active_disaster_to_deck()
                    game.reset_round_data()
                    game.transition_to_phase(GamePhase.BEGIN_ROUND, time_left=1)
                else:
                    # Uno se quedó sin cartas, pierde por default.
                    game.set_round_results(winners=game.round_winners, losers=players_out_of_cards)
                    game.set_sudden_death_players([])
                    game.transition_to_phase(GamePhase.RESOLVING_ROUND_LOSERS, time_left=5)
            else:
                # OTRA ronda de selección de muerte súbita
                game.set_sudden_death_players(new_losers)
                game.reset_for_sudden_death()
                game.transition_to_phase(GamePhase.PLAY_SUDDEN_DEATH_CARDS, time_left=game.config.select_card_phase_timer)

    def resolve_round_losers(self, game: Game) -> None:
        """
        Fase: RESOLVING_ROUND_LOSERS
        Le entrega la carta de desastre al perdedor y evalúa si queda eliminado.
        """
        if game.phase != GamePhase.RESOLVING_ROUND_LOSERS:
            return

        # 1. Repartir el desastre al perdedor
        # (Nuestra lógica de Muerte Súbita garantiza que aquí solo llegue 1 perdedor)
        for loser_id in game.round_losers:
            if game.active_disaster:
                game.give_disaster_to_player(loser_id)
            
            # 2. Verificar si el jugador "se extingue" por exceso de desastres
            if game.check_if_player_lost(loser_id):
                game.eliminate_player(loser_id)

        # 3. Transición rápida a los puntos pasivos (El Frontend mostrará la animación del meteorito cayendo)
        game.transition_to_phase(GamePhase.RESOLVING_VICTORY_POINTS, time_left=3)


    def resolve_victory_points(self, game: Game) -> None:
        """
        Fase: RESOLVING_VICTORY_POINTS
        Da puntos de consolación a los vivos por sus desastres y revisa si alguien gana.
        Limpia la mesa y reinicia el bucle.
        """
        if game.phase != GamePhase.RESOLVING_VICTORY_POINTS:
            return

        alive_players = game.alive_players
        game_over = False
        max_victory_points = 0

        # 1. PUNTOS PASIVOS (1 punto por cada desastre en su tablero)
        for player in alive_players:
            disaster_count = len(player.disaster_area)
            if disaster_count > 0:
                player.add_victory_points(disaster_count)

            # 2. SEGUNDA COMPROBACIÓN DE VICTORIA
            # (Alguien podría ganar alcanzando los 50 puntos gracias a sus desastres)
            if player.victory_points >= 50:
                if player.victory_points > max_victory_points:
                    game.set_game_winner(player.user_id)
                    max_victory_points = player.victory_points
                game_over = True

        # 3. REVISAR CONDICIÓN DE ÚLTIMO SOBREVIVIENTE
        # Si la fase anterior eliminó a todos menos a uno, ese gana automáticamente
        if len(alive_players) == 1 and not game_over:
            game.set_game_winner(alive_players[0].user_id)
            game_over = True

        # 4. DECIDIR EL DESTINO
        if game_over or len(alive_players) == 0:
            game.transition_to_phase(GamePhase.GAME_OVER, time_left=1)
        else:
            # Nadie ha ganado. Limpiamos la basura de la mesa y robamos cartas nuevas.
            game.reset_round_data()
            game.transition_to_phase(GamePhase.BEGIN_ROUND, time_left=1)