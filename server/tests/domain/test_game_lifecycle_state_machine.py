import pytest

from src.domain.entities.game import Game
from src.domain.dtos.game_dtos import GameStateDTO
from src.domain.exceptions import DomainException
from src.domain.services.game_flow_service import GameFlowService
from src.domain.services.game_lifecycle_state_machine import (
    GameLifecycleRegistry,
    GameLifecycleStateMachine,
)
from src.domain.value_objects.card import DisasterCard
from src.domain.value_objects.card_set import CardSet
from src.domain.value_objects.card_type import CardType
from src.domain.value_objects.character import Character
from src.domain.value_objects.character_type import CharacterType
from src.domain.value_objects.disaster_type import DisasterType
from src.domain.value_objects.expansion_type import ExpansionType
from src.domain.value_objects.game_config import GameConfig
from src.domain.value_objects.game_phase import GamePhase


def test_state_machine_starts_at_character_selection_and_validates_transitions():
    machine = GameLifecycleStateMachine()

    assert machine.current_state.id == "character_selection"

    machine.transition_to(GamePhase.CHARACTER_SELECTION, GamePhase.INITIAL_SHUFFLE)
    machine.transition_to(GamePhase.INITIAL_SHUFFLE, GamePhase.BEGIN_ROUND)
    machine.transition_to(GamePhase.BEGIN_ROUND, GamePhase.PLAY_POINT_CARDS)

    assert machine.current_state.id == "play_point_cards"

    with pytest.raises(DomainException, match="Transición de partida inválida"):
        machine.transition_to(GamePhase.PLAY_POINT_CARDS, GamePhase.GAME_OVER)

    assert machine.current_state.id == "play_point_cards"


def test_state_machine_supports_existing_round_and_sudden_death_paths():
    machine = GameLifecycleStateMachine()
    phases = [
        GamePhase.CHARACTER_SELECTION,
        GamePhase.INITIAL_SHUFFLE,
        GamePhase.BEGIN_ROUND,
        GamePhase.PLAY_POINT_CARDS,
        GamePhase.CALCULATE_ROUND_SCORE,
        GamePhase.RESOLVING_ROUND_WINNERS,
        GamePhase.PLAY_SUDDEN_DEATH_CARDS,
        GamePhase.RESOLVING_SUDDEN_DEATH,
        GamePhase.PLAY_SUDDEN_DEATH_CARDS,
        GamePhase.RESOLVING_SUDDEN_DEATH,
        GamePhase.RESOLVING_ROUND_LOSERS,
        GamePhase.RESOLVING_VICTORY_POINTS,
        GamePhase.GAME_OVER,
    ]

    for current, target in zip(phases, phases[1:]):
        machine.transition_to(current, target)

    assert machine.current_state.id == "game_over"


def test_registry_rejects_a_second_game_for_the_same_room():
    registry = GameLifecycleRegistry()
    first_game = Game("ROOM", {"one": "One", "two": "Two"}, GameConfig())
    duplicate_game = Game("ROOM", {"one": "One", "two": "Two"}, GameConfig())

    registry.register(first_game)

    with pytest.raises(DomainException, match="Ya existe una partida activa"):
        registry.register(duplicate_game)

    assert registry.machine_for(first_game).current_state.id == "character_selection"
    with pytest.raises(DomainException, match="no está registrada"):
        registry.machine_for(duplicate_game)


def test_game_state_response_keeps_the_existing_dto_shape():
    game = Game("ROOM", {"one": "One"}, GameConfig())

    dto = GameStateDTO.from_entity(game, [])

    assert set(dto.model_dump()) == {
        "room_code",
        "game_phase",
        "time_left",
        "players",
        "available_characters",
        "selections",
        "seating_order",
        "round_winners",
        "round_losers",
        "game_winner",
        "eliminated_players",
        "sudden_death_players",
        "active_disaster",
        "tools_count",
        "disasters_count",
        "discard_count",
        "top_discard_card",
    }
    assert set(dto.model_dump()["players"][0]) == {
        "user_id",
        "username",
        "victory_points",
        "round_score",
        "character",
        "hand",
        "disaster_zone",
        "sacrifice_zone",
        "instant_zone",
        "played_card",
    }


def test_game_flow_setup_and_startup_advance_through_registered_machine():
    class CharacterStoreStub:
        def get_character(self, character_type):
            return None

    game = Game("ROOM", {"one": "One", "two": "Two"}, GameConfig())
    characters = [
        Character(
            type=CharacterType.STEGOSAURUS,
            display_name="Stegosaurus",
            initial_traits={},
            expansion=ExpansionType.BASE,
        ),
        Character(
            type=CharacterType.TRICERATOPS,
            display_name="Triceratops",
            initial_traits={},
            expansion=ExpansionType.BASE,
        ),
    ]
    disaster_set = CardSet(
        expansion=ExpansionType.BASE,
        is_two_player_compatible=True,
        cards=[
            DisasterCard(
                card_id="disaster",
                instance_id="disaster-1",
                type=CardType.DISASTER,
                disaster_values={DisasterType.NATURAL: 1},
            )
        ],
    )
    service = GameFlowService(CharacterStoreStub())

    service.setup_game(game, characters, [], [disaster_set])
    assert game.phase == GamePhase.CHARACTER_SELECTION
    assert game.time_left == 30

    service.finalize_character_selection(game)
    assert game.phase == GamePhase.INITIAL_SHUFFLE

    service.start_initial_shuffle(game)
    assert game.phase == GamePhase.BEGIN_ROUND

    service.begin_round(game)
    assert game.phase == GamePhase.PLAY_POINT_CARDS

    service.reveal_main_cards(game)
    service.calculate_round_scores(game)
    game.set_round_results(winners=["two"], losers=["one"])
    service.resolve_round_winners(game)
    assert game.phase == GamePhase.RESOLVING_ROUND_LOSERS

    service.resolve_round_losers(game)
    game.eliminate_player("one")
    service.resolve_victory_points(game)

    assert game.phase == GamePhase.GAME_OVER
    assert game.game_winner == "two"
