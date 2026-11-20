from pydantic import BaseModel
from typing import List, Dict, Optional
from src.domain.entities.game import Game
from src.domain.value_objects.card import Card
from src.domain.value_objects.character import Character

# NUEVO: DTO estándar para que el frontend dibuje las cartas
class CardDTO(BaseModel):
    id: str
    type: str

class GamePlayerSnapshotDTO(BaseModel):
    user_id: str
    username: str
    victory_points: int
    round_score: int
    character: Optional[str] # Así evitamos tener que cruzar el diccionario en el frontend
    # NUEVO: Todas las zonas del jugador
    hand: List[CardDTO]
    disaster_zone: List[CardDTO]
    sacrifice_zone: List[CardDTO]
    instant_zone: List[CardDTO]
    played_card: Optional[CardDTO]

class TraitDTO(BaseModel):
    disaster_type: str 
    modifier: int

class CharacterDTO(BaseModel):
    type: str
    display_name: str
    initial_traits: List[TraitDTO]

class GameStateDTO(BaseModel):
    room_code: str
    game_phase: str
    time_left: int
    players: List[GamePlayerSnapshotDTO]
    available_characters: List[CharacterDTO]
    selections: Dict[str, Optional[str]]
    seating_order: List[str]

    round_winners: List[str]
    round_losers: List[str]
    game_winner: Optional[str]
    eliminated_players: List[str]
    sudden_death_players: List[str]
    
    # NUEVO: Datos centrales de la mesa de juego
    active_disaster: Optional[CardDTO]
    tools_count: int
    disasters_count: int
    discard_count: int
    top_discard_card: Optional[CardDTO]

    def personalize_for(self, viewer_id: str) -> dict:
        """
        Filtra la información sensible para que el cliente solo vea lo que debe ver.
        Convierte el modelo a dict censurando las cartas enemigas.
        """
        data = self.model_dump()
        
        for player in data["players"]:
            is_me = (player["user_id"] == viewer_id)
            
            if not is_me:
                # 1. Ocultar la mano (mantenemos la cantidad para dibujar los dorsos)
                player["hand"] = [{"id": "HIDDEN_CARD", "type": "UNKNOWN"} for _ in player["hand"]]
                
                # 2. Ocultar la carta jugada en la mesa si seguimos en la fase de elegir
                if self.game_phase in ["PLAY_POINT_CARDS", "PLAY_SUDDEN_DEATH_CARDS"] and player["played_card"] is not None:
                    player["played_card"] = {"id": "HIDDEN_CARD", "type": "UNKNOWN"}
                    
                # A futuro, aquí mismo puedes censurar las Instantáneas si lo requieres.
                
        return data

    @staticmethod
    def _map_card(card: Optional[Card]) -> Optional[CardDTO]:
        """Helper para parsear la entidad Carta al DTO visual."""
        if not card:
            return None
        return CardDTO(
            id=card.instance_id,
            type=card.type.value if hasattr(card.type, 'value') else str(card.type)
        )

    @classmethod
    def from_entity(cls, game: Game, available_characters: List[Character]) -> "GameStateDTO":
        
        # Mapeamos a los jugadores con todas sus cartas
        players_snapshot = [
            GamePlayerSnapshotDTO(
                user_id=player.user_id, 
                username=player.username,
                victory_points=player.victory_points,
                round_score = player.round_score,
                character=player.character_type.value if player.character_type else None,
                # Mapeamos cada carta de sus zonas
                hand=[cls._map_card(c) for c in player.hand],
                disaster_zone=[cls._map_card(c) for c in player.disaster_area],
                sacrifice_zone=[cls._map_card(c) for c in player.sacrifice_zone],
                instant_zone=[cls._map_card(c) for c in player.instant_zone],
                played_card=cls._map_card(player.played_card)
            ) 
            for player in game.players.values()
        ]
        
        available_chars_dto = [
            CharacterDTO(
                type=char.type.value,
                display_name=char.display_name,
                initial_traits=[
                    TraitDTO(disaster_type=disaster.value, modifier=value)
                    for disaster, value in char.initial_traits.items()
                ]
            ) for char in available_characters
        ]
        
        selections_dto = {
            uid: (char.value if char else None) 
            for uid, char in game.selections.items()
        }

        return cls(
            room_code=game.room_code,
            game_phase=game.phase.value,
            time_left=game.time_left,
            players=players_snapshot,
            available_characters=available_chars_dto,
            selections=selections_dto,
            seating_order=game.seating_order,

            round_winners=game.round_winners,
            round_losers=game.round_losers,
            game_winner=game.game_winner,
            eliminated_players=game.eliminated_players,
            sudden_death_players=game.sudden_death_players,
            
            # NUEVO: Centro de la Mesa
            active_disaster=cls._map_card(game.active_disaster),
            tools_count=game.tools_deck_count,
            disasters_count=game.disasters_deck_count,
            discard_count=game.discard_pile_count,
            top_discard_card=cls._map_card(game.top_discard_card)
        )