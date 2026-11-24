import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { CenterTableZone } from '../game_components/CenterTableZone';
import { PlayerSeat } from '../game_components/PlayerSeat';
import { GameTimer } from '../game_components/GameTimer';
import { useMatchStore, selectPlayers, selectGamePhase } from '../../hooks/match_store';

interface GameTableProps {
    localUserId: string;
    tableWidth: number;
    tableHeight: number;
}

// Fases en las que se muestra el reloj sobre la mesa.
const PHASES_WITH_TIMER: readonly string[] = ["PLAY_POINT_CARDS", "PLAY_INSTANT_CARDS"];

export const GameTable: React.FC<GameTableProps> = ({ 
    localUserId, tableWidth, tableHeight
}) => {
    // ---- Lectura del store ----
    // Solo necesitamos los ids: con useShallow la mesa no re-renderiza cuando cambia
    // el puntaje, la mano, etc. de un jugador (cada PlayerSeat lee lo suyo).
    const playerIds = useMatchStore(
        useShallow((s) => selectPlayers(s).map((p) => p.user_id))
    );
    // Booleano primitivo derivado de la fase.
    const showTimer = useMatchStore((s) => PHASES_WITH_TIMER.includes(selectGamePhase(s) ?? ''));

    const seatedIds = useMemo(() => {
        const localIndex = playerIds.indexOf(localUserId);
        if (localIndex === -1) return playerIds;
        return [
            ...playerIds.slice(localIndex),
            ...playerIds.slice(0, localIndex)
        ];
    }, [playerIds, localUserId]);

    const numPlayers = seatedIds.length;

    const getSeatClasses = (index: number) => {
        if (index === 0) return { gridArea: 'col-start-2 row-start-3', pos: 'bottom' };
        switch (numPlayers) {
            case 2:
                if (index === 1) return { gridArea: 'col-start-2 row-start-1', pos: 'top' };
                break;
            case 3:
                if (index === 1) return { gridArea: 'col-start-1 row-start-1', pos: 'top' };
                if (index === 2) return { gridArea: 'col-start-3 row-start-1', pos: 'top' };
                break;
            case 4:
                if (index === 1) return { gridArea: 'col-start-1 row-start-3', pos: 'bottom' };
                if (index === 2) return { gridArea: 'col-start-2 row-start-1', pos: 'top' };
                if (index === 3) return { gridArea: 'col-start-3 row-start-3', pos: 'bottom' };
                break;
            case 5:
                if (index === 1) return { gridArea: 'col-start-1 row-start-3', pos: 'bottom' };
                if (index === 2) return { gridArea: 'col-start-1 row-start-1', pos: 'top' };
                if (index === 3) return { gridArea: 'col-start-3 row-start-1', pos: 'top' };
                if (index === 4) return { gridArea: 'col-start-3 row-start-3', pos: 'bottom' };
                break;
            case 6:
                if (index === 1) return { gridArea: 'col-start-1 row-start-3', pos: 'bottom' };
                if (index === 2) return { gridArea: 'col-start-1 row-start-1', pos: 'top' };
                if (index === 3) return { gridArea: 'col-start-2 row-start-1', pos: 'top' };
                if (index === 4) return { gridArea: 'col-start-3 row-start-1', pos: 'top' };
                if (index === 5) return { gridArea: 'col-start-3 row-start-3', pos: 'bottom' };
                break;
        }
        return { gridArea: 'hidden', pos: 'top' }; 
    };

    const cellWidth = tableWidth / 3;
    const cellHeight = tableHeight / 3;

    return (
        <div className="relative w-full h-full p-2">
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-2">
                
                {/* ZONA CENTRAL DE LA MESA */}
                <div className="col-start-2 row-start-2 flex items-center justify-center min-w-0 min-h-0">
                    <CenterTableZone cellWidth={cellWidth} cellHeight={cellHeight} />
                </div>

                {/* EL RELOJ DE LA PARTIDA (Columna 3, Fila 2) */}
                {showTimer && (
                    <GameTimer 
                        className="col-start-3 row-start-2 flex items-center justify-center min-w-0 min-h-0" 
                    />
                )}

                {/* LOS JUGADORES */}
                {seatedIds.map((userId, index) => {
                    const { gridArea, pos } = getSeatClasses(index);

                    return (
                        <div key={userId} className={`${gridArea} flex items-center justify-center min-w-0 min-h-0`}>
                            <PlayerSeat 
                                userId={userId}
                                isLocalPlayer={userId === localUserId}
                                position={pos as 'top' | 'bottom' | 'middle'}
                                cellWidth={cellWidth}   
                                cellHeight={cellHeight} 
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
