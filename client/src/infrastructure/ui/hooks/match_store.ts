import { create } from 'zustand';
import type {
    Character,
    GamePlayerSnapshot,
    GameStateDTO,
} from '../../../domain/dtos/game_dtos';

/*
 * Store global de la PARTIDA (únicamente).
 * No incluye login, lista de salas ni chat.
 *
 * Patrón de lectura (cada componente pide solo su dato):
 *
 *   const timeLeft = useMatchStore(selectTimeLeft);            // GameTimer
 *   const seat     = useMatchStore(selectPlayerById(userId));  // PlayerSeat
 *   const hand     = useMatchStore(s => selectPlayerById(userId)(s)?.hand ?? EMPTY_CARDS);
 *
 * Para leer varios campos primitivos a la vez usa `useShallow`:
 *
 *   import { useShallow } from 'zustand/react/shallow';
 *   const { a, b } = useMatchStore(useShallow(s => ({ a: ..., b: ... })));
 *
 * Fuera de React (por ejemplo, desde el callback onUpdate del WebSocket):
 *
 *   useMatchStore.getState().applyServerState(dto);
 */

// ─────────────────────────────────────────────────────────────
// Fases del servidor → etapas de la UI
// ─────────────────────────────────────────────────────────────

/** Las 3 "pantallas" de la partida. Varias fases del servidor caen en la misma etapa. */
export type MatchStage = 'CHARACTER_SELECTION' | 'TABLE' | 'GAME_OVER' | 'UNKNOWN';

export const TABLE_PHASES: readonly string[] = [
    'INITIAL_SHUFFLE',
    'BEGIN_ROUND',
    'PLAY_POINT_CARDS',
    'RESOLVING_EFFECTS',
    'PLAY_INSTANT_CARDS',
    'CALCULATE_ROUND_SCORE',
    'RESOLVING_ROUND_WINNERS',
    'RESOLVING_ROUND_LOSERS',
    'PLAY_SUDDEN_DEATH_CARDS',
    'RESOLVING_SUDDEN_DEATH',
    'RESOLVING_VICTORY_POINTS',
];

export const getMatchStage = (phase: string): MatchStage => {
    if (phase === 'CHARACTER_SELECTION') return 'CHARACTER_SELECTION';
    if (phase === 'GAME_OVER') return 'GAME_OVER';
    if (TABLE_PHASES.includes(phase)) return 'TABLE';
    return 'UNKNOWN';
};

// ─────────────────────────────────────────────────────────────
// Compartición estructural
// ─────────────────────────────────────────────────────────────

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * El servidor manda el snapshot completo en cada mensaje y `JSON.parse` crea
 * referencias nuevas en TODO el árbol, aunque casi nada haya cambiado.
 * Sin esto, cualquier selector que devuelva un objeto/array (players, hand,
 * active_disaster...) re-renderizaría en cada mensaje.
 *
 * Devuelve `prev` si es estructuralmente igual a `next`; si no, devuelve `next`
 * reutilizando las ramas internas que no cambiaron (misma idea que
 * `replaceEqualDeep` de TanStack Query).
 */
const reuseUnchanged = <T,>(prev: unknown, next: T): T => {
    if (Object.is(prev, next)) return next;

    if (Array.isArray(next)) {
        if (!Array.isArray(prev)) return next;
        const merged = next.map((item, i) => reuseUnchanged(prev[i], item));
        const same =
            merged.length === prev.length && merged.every((item, i) => item === prev[i]);
        return (same ? prev : merged) as T;
    }

    if (isPlainObject(next)) {
        if (!isPlainObject(prev)) return next;
        const keys = Object.keys(next);
        const merged: Record<string, unknown> = {};
        for (const key of keys) {
            merged[key] = reuseUnchanged(prev[key], next[key]);
        }
        const same =
            keys.length === Object.keys(prev).length &&
            keys.every((key) => merged[key] === prev[key]);
        return (same ? prev : merged) as T;
    }

    return next;
};

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

interface MatchState {
    /**
     * Último snapshot completo recibido del servidor.
     * null = todavía no llega, o se limpió al salir de la partida.
     * Cubre las 3 etapas: selección de personaje, mesa y fin de partida.
     */
    gameState: GameStateDTO | null;
}

interface MatchActions {
    /** Guarda el snapshot del servidor conservando las referencias que no cambiaron. */
    applyServerState: (incoming: GameStateDTO | null) => void;
    /** Limpia todo el estado de la partida (al salir de ella). */
    resetMatch: () => void;
}

export type MatchStore = MatchState & MatchActions;

const initialState: MatchState = {
    gameState: null,
};

export const useMatchStore = create<MatchStore>()((set) => ({
    ...initialState,

    applyServerState: (incoming) =>
        set((state) => {
            const next = reuseUnchanged(state.gameState, incoming);
            // Si nada cambió, no notificamos a ningún suscriptor.
            return next === state.gameState ? state : { gameState: next };
        }),

    resetMatch: () => set(initialState),
}));

// ─────────────────────────────────────────────────────────────
// Selectores
// ─────────────────────────────────────────────────────────────
// Regla: un selector debe devolver siempre la MISMA referencia mientras el dato
// no cambie. Por eso los "valores vacíos" son constantes de módulo y no `[]`/`{}`
// creados en cada llamada (con Zustand 5 eso causa un bucle de renders).
// Las constantes vacías son solo de lectura: no las mutes.

const EMPTY_PLAYERS: GamePlayerSnapshot[] = [];
const EMPTY_CHARACTERS: Character[] = [];
const EMPTY_IDS: string[] = [];
const EMPTY_SELECTIONS: Record<string, string | null> = {};

// Generales ---------------------------------------------------

export const selectGameState = (s: MatchStore) => s.gameState;
export const selectGamePhase = (s: MatchStore) => s.gameState?.game_phase ?? null;
export const selectMatchStage = (s: MatchStore): MatchStage | null =>
    s.gameState ? getMatchStage(s.gameState.game_phase) : null;
export const selectRoomCode = (s: MatchStore) => s.gameState?.room_code ?? null;

/** Primitivo: GameTimer solo re-renderiza cuando cambia el tiempo. 0 si aún no hay estado. */
export const selectTimeLeft = (s: MatchStore) => s.gameState?.time_left ?? 0;

// Jugadores ---------------------------------------------------

export const selectPlayers = (s: MatchStore) => s.gameState?.players ?? EMPTY_PLAYERS;
export const selectSeatingOrder = (s: MatchStore) => s.gameState?.seating_order ?? EMPTY_IDS;

/** Fábrica de selector: `useMatchStore(selectPlayerById(userId))`. */
export const selectPlayerById =
    (userId: string) =>
    (s: MatchStore): GamePlayerSnapshot | null =>
        s.gameState?.players.find((p) => p.user_id === userId) ?? null;

// Selección de personaje --------------------------------------

export const selectAvailableCharacters = (s: MatchStore) =>
    s.gameState?.available_characters ?? EMPTY_CHARACTERS;
export const selectSelections = (s: MatchStore) => s.gameState?.selections ?? EMPTY_SELECTIONS;

// Mesa --------------------------------------------------------

export const selectActiveDisaster = (s: MatchStore) => s.gameState?.active_disaster ?? null;
export const selectToolsCount = (s: MatchStore) => s.gameState?.tools_count ?? 0;
export const selectDisastersCount = (s: MatchStore) => s.gameState?.disasters_count ?? 0;
export const selectDiscardCount = (s: MatchStore) => s.gameState?.discard_count ?? 0;
export const selectTopDiscardCard = (s: MatchStore) => s.gameState?.top_discard_card ?? null;

export const selectRoundWinners = (s: MatchStore) => s.gameState?.round_winners ?? EMPTY_IDS;
export const selectRoundLosers = (s: MatchStore) => s.gameState?.round_losers ?? EMPTY_IDS;
export const selectEliminatedPlayers = (s: MatchStore) =>
    s.gameState?.eliminated_players ?? EMPTY_IDS;
export const selectSuddenDeathPlayers = (s: MatchStore) =>
    s.gameState?.sudden_death_players ?? EMPTY_IDS;

// Fin de partida ----------------------------------------------

export const selectGameWinner = (s: MatchStore) => s.gameState?.game_winner ?? null;
