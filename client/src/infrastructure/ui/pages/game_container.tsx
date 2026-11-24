import React, { useEffect } from 'react';
import { CharacterSelectionPage } from './caracter_selection_page';
import { TablePage } from './table_page'
import { useRequestGameState } from '../hooks/use_request_game_state'; // <-- Importamos el hook
import { useSyncMatchStore } from '../hooks/use_sync_match_store';
import {
    useMatchStore,
    selectGamePhase,
    selectMatchStage,
    getMatchStage,
} from '../hooks/match_store';
import type { GameStateDTO } from '../../../domain/dtos/game_dtos';

interface GameContainerProps {
    gameState: GameStateDTO | null;
}

export const GameContainer: React.FC<GameContainerProps> = ({ gameState }) => {
    
    // Obtenemos la función para "gritarle" al servidor
    const { requestGameState } = useRequestGameState();

    // Alimentamos el store de la partida con lo que llega por prop (y lo limpiamos al desmontar)
    useSyncMatchStore(gameState);

    // Leemos la etapa y la fase desde el store (primitivos: solo re-renderiza si cambian)
    const stage = useMatchStore(selectMatchStage);
    const phase = useMatchStore(selectGamePhase);

    // El Efecto "Desatascador": Si este contenedor nace y no hay estado, ¡lo pedimos!
    useEffect(() => {
        if (!gameState) {
            requestGameState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState]);

    // 1. Pantalla de carga segura
    // También cubre el instante (antes de pintar) en que el store aún no alcanza a la prop
    // al cambiar de etapa, para no renderizar la pantalla equivocada con el estado nuevo.
    if (!gameState || stage !== getMatchStage(gameState.game_phase)) {
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a', color: 'white' }}>
                Preparando el tablero...
            </div>
        );
    }

    // 2. EL SUB-ENRUTADOR DEL JUEGO (la etapa sale del store)
    switch (stage) {
        // 1. FASE DE PREPARACIÓN (Pantalla completa distinta)
        case 'CHARACTER_SELECTION':
            return <CharacterSelectionPage gameState={gameState} />;

        // 2. FASES DE MESA (Todas estas dibujan la misma TablePage)
        case 'TABLE':
            // La TablePage NUNCA se desmonta entre estas fases, 
            // solo reacciona a los cambios internos de gameState
            return <TablePage gameState={gameState} />;

        // 3. FASE FINAL (Pantalla completa distinta)
        case 'GAME_OVER':
            // return <GameOverPage gameState={gameState} />;
            return <div style={{ color: "white" }}>Pantalla de Victoria/Derrota</div>;

        // Fallback
        default:
            return <div style={{ color: "white" }}>Fase de juego no implementada: {phase}</div>;
    }
};
