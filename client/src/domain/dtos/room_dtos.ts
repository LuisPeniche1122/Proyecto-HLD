export interface RoomListItemDTO {
    room_code: string;
    host_username: string;
    player_count: number;
    max_players: number;
    game_config: GameConfig;
}

export interface CreateRoomResponseDTO {
    room_code: string;
}

export interface PlayerSnapshotDTO {
    user_id: string;
    username: string;
    is_host: boolean;
    is_ready: boolean;
}

export interface GameConfig {
    select_card_phase_timer: number;
    instant_card_phase_timer: number;
    use_dating_disasters: boolean;
    use_perils_of_puberty: boolean;
    use_5_6_expansion: boolean;
}

export interface ChatMessageDTO {
    user: string;
    text: string;
}

export interface RoomStateDTO {
    room_code: string;
    max_players: number;
    is_private: boolean;
    room_phase: string;
    is_full: boolean;
    game_config: GameConfig;
    players: PlayerSnapshotDTO[];
    chat_history: ChatMessageDTO[];
}