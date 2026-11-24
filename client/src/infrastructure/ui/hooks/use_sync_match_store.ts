import { useEffect, useLayoutEffect } from 'react';
import type { GameStateDTO } from '../../../domain/dtos/game_dtos';
import { useMatchStore } from '../hooks/match_store';

/**
 * Mantiene `match_store` sincronizado con el estado de la partida que llega del servidor.
 *
 * - Cada vez que cambia `gameState`, lo vuelca al store.
 * - Al desmontarse (salir de la partida) limpia el store.
 *
 * Transición: hoy el estado entra por la prop de GameContainer. Cuando el callback
 * `onUpdate` del WebSocket escriba directo con `useMatchStore.getState().applyServerState(dto)`,
 * este hook deja de ser necesario (y la prop también).
 */
export const useSyncMatchStore = (gameState: GameStateDTO | null): void => {
    const applyServerState = useMatchStore((s) => s.applyServerState);
    const resetMatch = useMatchStore((s) => s.resetMatch);

    // useLayoutEffect (no useEffect): el store se actualiza antes de que el navegador
    // pinte, así nadie ve ni un fotograma con el store desfasado respecto al servidor.
    useLayoutEffect(() => {
        applyServerState(gameState);
    }, [gameState, applyServerState]);

    // Limpieza al salir de la partida. En StrictMode (desarrollo) React simula un
    // desmontaje/montaje: el reset se aplica y el efecto de arriba vuelve a llenar el store.
    useEffect(() => {
        return () => resetMatch();
    }, [resetMatch]);
};
