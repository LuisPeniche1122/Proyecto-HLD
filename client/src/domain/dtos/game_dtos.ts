// 1. NUEVO: DTO para las cartas
export interface CardDTO {
    id: string;
    type: string;
}

// 2. MODIFICADO: Snapshot del jugador
export interface GamePlayerSnapshot {
    user_id: string;
    username: string;
    victory_points: number;
    round_score: number;
    character: string | null; // <-- AÑADIDO: Directo en el jugador

    // <-- AÑADIDO: Zonas de cartas del jugador
    hand: CardDTO[];
    disaster_zone: CardDTO[];
    sacrifice_zone: CardDTO[];
    instant_zone: CardDTO[];
    played_card: CardDTO | null;
}

// 3. INTACTOS: Traits y Characters
export interface Trait {
    disaster_type: string;
    modifier: number;
}

export interface Character {
    type: string;
    display_name: string;
    initial_traits: Trait[];
}

// 4. MODIFICADO: Estado global del juego
export interface GameStateDTO {
    room_code: string;
    game_phase: string;
    time_left: number;
    players: GamePlayerSnapshot[];
    available_characters: Character[];
    selections: Record<string, string | null>; 
    seating_order: string[];

    round_winners: string[];
    round_losers: string[];
    game_winner: string | null;
    eliminated_players: string[];
    sudden_death_players: string[];

    // <-- AÑADIDO: Mesa Central
    active_disaster: CardDTO | null;
    tools_count: number;
    disasters_count: number;
    discard_count: number;
    top_discard_card: CardDTO | null;
}