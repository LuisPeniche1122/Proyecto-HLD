from threading import RLock
from typing import Dict, Tuple

from statemachine import State, StateMachine
from statemachine.exceptions import TransitionNotAllowed

from src.domain.entities.game import Game
from src.domain.exceptions import DomainException
from src.domain.value_objects.game_phase import GamePhase


class GameLifecycleStateMachine(StateMachine):
    """Transiciones válidas para las fases utilizadas por el flujo de partidas."""

    character_selection = State(initial=True)
    initial_shuffle = State()
    begin_round = State()
    play_point_cards = State()
    calculate_round_score = State()
    resolving_round_winners = State()
    resolving_round_losers = State()
    play_sudden_death_cards = State()
    resolving_sudden_death = State()
    resolving_victory_points = State()
    game_over = State(final=True)

    finalize_character_selection = character_selection.to(initial_shuffle)
    start_round = initial_shuffle.to(begin_round)
    deal_round = begin_round.to(play_point_cards)
    reveal_main_cards = play_point_cards.to(calculate_round_score)
    calculate_scores = calculate_round_score.to(resolving_round_winners)

    winners_to_begin_round = resolving_round_winners.to(begin_round)
    winners_to_round_losers = resolving_round_winners.to(resolving_round_losers)
    winners_to_sudden_death = resolving_round_winners.to(play_sudden_death_cards)
    winners_to_game_over = resolving_round_winners.to(game_over)

    resolve_losers = resolving_round_losers.to(resolving_victory_points)
    reveal_sudden_death = play_sudden_death_cards.to(resolving_sudden_death)
    sudden_death_to_losers = resolving_sudden_death.to(resolving_round_losers)
    sudden_death_to_begin_round = resolving_sudden_death.to(begin_round)
    sudden_death_to_repeat = resolving_sudden_death.to(play_sudden_death_cards)
    victory_points_to_begin_round = resolving_victory_points.to(begin_round)
    victory_points_to_game_over = resolving_victory_points.to(game_over)

    _TRANSITIONS: Dict[Tuple[GamePhase, GamePhase], str] = {
        (GamePhase.CHARACTER_SELECTION, GamePhase.INITIAL_SHUFFLE): "finalize_character_selection",
        (GamePhase.INITIAL_SHUFFLE, GamePhase.BEGIN_ROUND): "start_round",
        (GamePhase.BEGIN_ROUND, GamePhase.PLAY_POINT_CARDS): "deal_round",
        (GamePhase.PLAY_POINT_CARDS, GamePhase.CALCULATE_ROUND_SCORE): "reveal_main_cards",
        (GamePhase.CALCULATE_ROUND_SCORE, GamePhase.RESOLVING_ROUND_WINNERS): "calculate_scores",
        (GamePhase.RESOLVING_ROUND_WINNERS, GamePhase.BEGIN_ROUND): "winners_to_begin_round",
        (GamePhase.RESOLVING_ROUND_WINNERS, GamePhase.RESOLVING_ROUND_LOSERS): "winners_to_round_losers",
        (GamePhase.RESOLVING_ROUND_WINNERS, GamePhase.PLAY_SUDDEN_DEATH_CARDS): "winners_to_sudden_death",
        (GamePhase.RESOLVING_ROUND_WINNERS, GamePhase.GAME_OVER): "winners_to_game_over",
        (GamePhase.RESOLVING_ROUND_LOSERS, GamePhase.RESOLVING_VICTORY_POINTS): "resolve_losers",
        (GamePhase.PLAY_SUDDEN_DEATH_CARDS, GamePhase.RESOLVING_SUDDEN_DEATH): "reveal_sudden_death",
        (GamePhase.RESOLVING_SUDDEN_DEATH, GamePhase.RESOLVING_ROUND_LOSERS): "sudden_death_to_losers",
        (GamePhase.RESOLVING_SUDDEN_DEATH, GamePhase.BEGIN_ROUND): "sudden_death_to_begin_round",
        (GamePhase.RESOLVING_SUDDEN_DEATH, GamePhase.PLAY_SUDDEN_DEATH_CARDS): "sudden_death_to_repeat",
        (GamePhase.RESOLVING_VICTORY_POINTS, GamePhase.BEGIN_ROUND): "victory_points_to_begin_round",
        (GamePhase.RESOLVING_VICTORY_POINTS, GamePhase.GAME_OVER): "victory_points_to_game_over",
    }

    def transition_to(self, current_phase: GamePhase, target_phase: GamePhase) -> None:
        current_state = self.current_state.id
        if current_state != current_phase.name.lower():
            raise DomainException("El estado de la máquina no coincide con la fase de la partida.")

        if current_phase == target_phase:
            return

        event_name = self._TRANSITIONS.get((current_phase, target_phase))
        if event_name is None:
            raise DomainException(
                f"Transición de partida inválida: {current_phase.value} -> {target_phase.value}."
            )

        try:
            getattr(self, event_name)()
        except TransitionNotAllowed as error:
            raise DomainException(
                f"Transición de partida inválida: {current_phase.value} -> {target_phase.value}."
            ) from error


class GameLifecycleRegistry:
    """Asocia cada partida activa con una máquina y un lock, sin duplicar el repositorio."""

    def __init__(self) -> None:
        self.__machines: Dict[str, GameLifecycleStateMachine] = {}
        self.__games: Dict[str, Game] = {}
        self.__locks: Dict[str, RLock] = {}
        self.__registry_lock = RLock()

    def lock_for(self, room_code: str) -> RLock:
        with self.__registry_lock:
            if room_code not in self.__locks:
                self.__locks[room_code] = RLock()
            return self.__locks[room_code]

    def register(self, game: Game) -> None:
        with self.lock_for(game.room_code):
            existing_game = self.__games.get(game.room_code)
            if existing_game is not None and existing_game is not game:
                raise DomainException("Ya existe una partida activa para esta sala.")
            if existing_game is None:
                if game.phase != GamePhase.CHARACTER_SELECTION:
                    raise DomainException("La partida debe iniciar en selección de personajes.")
                self.__games[game.room_code] = game
                self.__machines[game.room_code] = GameLifecycleStateMachine()

    def machine_for(self, game: Game) -> GameLifecycleStateMachine:
        with self.lock_for(game.room_code):
            if self.__games.get(game.room_code) is not game:
                raise DomainException("La partida no está registrada en el flujo activo.")
            return self.__machines[game.room_code]
