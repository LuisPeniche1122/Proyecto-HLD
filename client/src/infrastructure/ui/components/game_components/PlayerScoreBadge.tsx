import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PlayerScore {
    username: string;
    avatarUrl?: string; // Opcional como fallback
    markerImageUrl?: string; // NUEVO: Para inyectar el Meeple
    victory_points: number;
}

interface PlayerScoreBadgeProps {
    player: PlayerScore;
    calculatedHeight: number;
    containerWidth: number; 
}

export const PlayerScoreBadge: React.FC<PlayerScoreBadgeProps> = ({ player, calculatedHeight, containerWidth }) => {
    const [isHovered, setIsHovered] = useState(false);

    const innerPadding = 4;
    const avatarSize = calculatedHeight - (innerPadding * 2);

    return (
        <div 
            className="flex items-center w-full min-w-0 bg-[#2a2a2a] rounded-full border border-[#444] relative cursor-pointer hover:bg-[#333] transition-colors"
            style={{ 
                height: `${calculatedHeight}px`,
                maxWidth: `${containerWidth}px`, 
                padding: `${innerPadding}px`
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* AVATAR / MEEPLE */}
            <div 
                // Si hay meeple, le quitamos el bg-[#111] y el rounded-full para que la imagen "respire"
                className={`shrink-0 relative z-10 flex items-center justify-center ${player.markerImageUrl ? '' : 'rounded-full overflow-hidden bg-[#111]'}`}
                style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
            >
                {player.markerImageUrl ? (
                    <img src={player.markerImageUrl} alt={`${player.username} meeple`} className="w-full h-full object-contain drop-shadow-md" />
                ) : (
                    <img src={player.avatarUrl} alt={`${player.username} avatar`} className="w-full h-full object-cover" />
                )}
            </div>

            {/* EL BOCADILLO (Tooltip flotante) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-full mr-3 px-3 py-1.5 bg-[#eee] text-[#111] text-sm font-bold rounded-lg shadow-xl whitespace-nowrap z-[100]"
                    >
                        {player.username}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-2 border-[5px] border-transparent border-l-[#eee]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ESPACIO FLEXIBLE */}
            <div className="flex-1 min-w-0" />

            {/* PUNTUACIÓN */}
            <div className="text-right shrink-0 pr-2 overflow-hidden">
                <span className="text-[#FFD700] font-bold text-base whitespace-nowrap">
                    {player.victory_points} 
                    <span className="text-xs text-[#aaa] font-normal ml-1 hidden sm:inline">pts</span>
                </span>
            </div>
        </div>
    );
};