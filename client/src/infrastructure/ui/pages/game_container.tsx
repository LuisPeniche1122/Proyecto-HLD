import React, { useEffect } from 'react';
import { CharacterSelectionPage } from './caracter_selection_page';
import { TablePage } from './table_page'
import { useRequestGameState } from '../hooks/use_request_game_state'; // <-- Importamos el hook
import type { GameStateDTO } from '../../../domain/dtos/game_dtos';

interface GameContainerProps {
    gameState: GameStateDTO | null;
}

const TABLE_PHASES = [
    "INITIAL_SHUFFLE",
    "BEGIN_ROUND",
    "PLAY_POINT_CARDS",
    "RESOLVING_EFFECTS",
    "PLAY_INSTANT_CARDS",
    "CALCULATE_ROUND_SCORE",
    "RESOLVING_ROUND_WINNERS",
    "RESOLVING_ROUND_LOSERS",
    "PLAY_SUDDEN_DEATH_CARDS",
    "RESOLVING_SUDDEN_DEATH",
    "RESOLVING_VICTORY_POINTS"
];

export const GameContainer: React.FC<GameContainerProps> = ({ gameState }) => {
    
    // Obtenemos la función para "gritarle" al servidor
    const { requestGameState } = useRequestGameState();

    // El Efecto "Desatascador": Si este contenedor nace y no hay estado, ¡lo pedimos!
    useEffect(() => {
        if (!gameState) {
            requestGameState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState]);

    // 1. Pantalla de carga segura
    if (!gameState) {
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a', color: 'white' }}>
                Preparando el tablero...
            </div>
        );
    }

    // 2. EL SUB-ENRUTADOR DEL JUEGO
    // 1. FASE DE PREPARACIÓN (Pantalla completa distinta)
    if (gameState.game_phase === "CHARACTER_SELECTION") {
        return <CharacterSelectionPage gameState={gameState} />;
    }

    // 2. FASES DE MESA (Todas estas dibujan la misma TablePage)
    if (TABLE_PHASES.includes(gameState.game_phase)) {
        // La TablePage NUNCA se desmonta entre estas fases, 
        // solo reacciona a los cambios internos de gameState
        return <TablePage gameState={gameState} />;
    }

    // 3. FASE FINAL (Pantalla completa distinta)
    if (gameState.game_phase === "GAME_OVER") {
        // return <GameOverPage gameState={gameState} />;
        return <div style={{ color: "white" }}>Pantalla de Victoria/Derrota</div>;
    }

    // Fallback
    return <div style={{ color: "white" }}>Fase de juego no implementada: {gameState.game_phase}</div>;
};