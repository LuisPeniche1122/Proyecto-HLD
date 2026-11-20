import React, { useMemo } from 'react';
import { CenterTableZone } from '../game_components/CenterTableZone';
import { PlayerSeat } from '../game_components/PlayerSeat';
import { GameTimer } from '../game_components/GameTimer';

interface GameTableProps {
    players: any[];
    localUserId: string;
    tableWidth: number;
    tableHeight: number;
    activeDisaster?: any;
    toolsCount: number;
    disastersCount: number;
    discardCount: number;
    topDiscardCard?: any;
    serverTimeLeft: number;
    currentPhase: string;
    showTimer: boolean;
}

export const GameTable: React.FC<GameTableProps> = ({ 
    players, localUserId, tableWidth, tableHeight, 
    activeDisaster, toolsCount, disastersCount, discardCount, topDiscardCard,
    serverTimeLeft, currentPhase, showTimer
}) => {

    const seatedPlayers = useMemo(() => {
        const localIndex = players.findIndex(p => p.user_id === localUserId);
        if (localIndex === -1) return players;
        return [
            ...players.slice(localIndex),
            ...players.slice(0, localIndex)
        ];
    }, [players, localUserId]);

    const numPlayers = seatedPlayers.length;

    const isMainCardRevealed = !["PLAY_POINT_CARDS", "PLAY_SUDDEN_DEATH_CARDS", "BEGIN_ROUND"].includes(currentPhase);

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
                    <CenterTableZone 
                        toolsCount={toolsCount} disastersCount={disastersCount} discardCount={discardCount} 
                        activeDisaster={activeDisaster} topDiscardCard={topDiscardCard}
                        cellWidth={cellWidth} cellHeight={cellHeight}
                    />
                </div>

                {/* EL RELOJ DE LA PARTIDA (Columna 3, Fila 2) */}
                {showTimer && (
                    <GameTimer 
                        serverTimeLeft={serverTimeLeft} 
                        currentPhase={currentPhase} 
                        className="col-start-3 row-start-2 flex items-center justify-center min-w-0 min-h-0" 
                    />
                )}

                {/* LOS JUGADORES */}
                {seatedPlayers.map((player, index) => {
                    const { gridArea, pos } = getSeatClasses(index);
                    const isLocalPlayer = player.user_id === localUserId;

                    return (
                        <div key={player.user_id} className={`${gridArea} flex items-center justify-center min-w-0 min-h-0`}>
                            <PlayerSeat 
                                player={player} 
                                isLocalPlayer={isLocalPlayer} // <-- Y se lo pasamos al asiento
                                position={pos as 'top' | 'bottom' | 'middle'}
                                mainCard={player.played_card || null}
                                isMainCardRevealed={isMainCardRevealed} 
                                sacrificedCards={player.sacrifice_zone || []}
                                instantCards={player.instant_zone || []}
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