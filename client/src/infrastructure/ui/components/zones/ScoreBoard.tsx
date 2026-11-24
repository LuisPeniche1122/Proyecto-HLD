import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlayerScoreBadge } from '../game_components/PlayerScoreBadge';
import { useMatchStore, selectPlayers } from '../../hooks/match_store';

// Los jugadores ya no llegan por props: se leen del store.
// Solo conservamos el identificador del jugador local.
interface ScoreboardProps {
    localUserId: string;
    className?: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ localUserId, className = '' }) => {
    const players = useMatchStore(selectPlayers);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            setContainerSize({
                width: entries[0].contentRect.width,
                height: entries[0].contentRect.height
            });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const GAP_SIZE = 8;
    const MAX_PLAYERS = 5;
    
    const badgeHeight = React.useMemo(() => {
        if (containerSize.height === 0) return 0;
        const availableHeight = containerSize.height - (GAP_SIZE * (MAX_PLAYERS - 1));
        return Math.floor(availableHeight / MAX_PLAYERS);
    }, [containerSize.height]);

    // Quitamos al jugador local y ordenamos por puntuación.
    // `filter` crea una copia, así que el sort no muta el array del store.
    // Cada badge lee sus propios datos por userId.
    const sortedPlayerIds = useMemo(
        () => players
            .filter(player => player.user_id !== localUserId)
            .sort((a, b) => b.victory_points - a.victory_points)
            .slice(0, MAX_PLAYERS)
            .map(player => player.user_id),
        [players, localUserId]
    );

    return (
        <div 
            ref={containerRef} 
            className={`w-full h-full flex flex-col justify-start items-stretch gap-[8px] min-w-0 ${className}`}
        >
            {badgeHeight > 0 && containerSize.width > 0 && sortedPlayerIds.map((userId) => (
                <PlayerScoreBadge 
                    key={userId}
                    userId={userId}
                    calculatedHeight={badgeHeight}
                    containerWidth={containerSize.width} // Pasamos el ancho máximo disponible
                />
            ))}
        </div>
    );
};
