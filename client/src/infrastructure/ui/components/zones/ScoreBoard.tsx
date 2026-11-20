import React, { useState, useEffect, useRef } from 'react';
import { PlayerScoreBadge } from '../game_components/PlayerScoreBadge';

// 1. RESTAURAMOS LA INTERFAZ: 
// (Asegúrate de que coincida con lo que tu componente PlayerScoreBadge espera leer. 
// Si tu DTO usa 'user_id', puedes cambiar 'id' por 'user_id' aquí y en el key del map).
export interface PlayerScore {
    user_id: string; // o user_id, dependiendo de cómo lo mapeaste en TablePage
    username: string;
    victory_points: number;
    avatarUrl?: string;
    markerImageUrl?: string;
}

interface ScoreboardProps {
    players: PlayerScore[];
    localUserId: string; // <-- NUEVO: Recibimos el ID del jugador local
    className?: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players, localUserId, className = '' }) => {
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

    // 2. FILTRAMOS Y ORDENAMOS:
    // Quitamos al jugador local de la lista antes de ordenar por puntuación
    const sortedPlayers = [...players]
        .filter(player => player.user_id !== localUserId) // Si usas user_id, cámbialo a player.user_id
        .sort((a, b) => b.victory_points - a.victory_points);

    return (
        <div 
            ref={containerRef} 
            className={`w-full h-full flex flex-col justify-start items-stretch gap-[8px] min-w-0 ${className}`}
        >
            {badgeHeight > 0 && containerSize.width > 0 && sortedPlayers.slice(0, MAX_PLAYERS).map((player) => (
                <PlayerScoreBadge 
                    key={player.user_id} // Si usas user_id, cámbialo a player.user_id
                    player={player}
                    calculatedHeight={badgeHeight}
                    containerWidth={containerSize.width} // Pasamos el ancho máximo disponible
                />
            ))}
        </div>
    );
};