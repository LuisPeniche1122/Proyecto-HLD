import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';

import { useMatchStore, selectPlayerById } from '../../hooks/match_store';
import { getCardAssets } from '../../dicts/cards_dict';

// Las cartas ya no llegan por props: se leen del store a partir del userId.
interface DisasterZoneProps {
    userId: string;
    renderCard: (card: any, index: number, motionProps: any, isInspected: boolean) => React.ReactNode;
    cardWidth: number;
    cardHeight: number; 
    maxSpacing?: number; 
    className?: string;
}

// Orden predefinido e inmutable para la zona de desastres
const DISASTER_ORDER = [
    'disaster-predator', 
    'disaster-natural', 
    'disaster-emotional', 
    'disaster-meteore'
];

export const DisasterZone: React.FC<DisasterZoneProps> = ({
    userId,
    renderCard,
    cardWidth,
    cardHeight,
    maxSpacing = 0, // Por defecto 0: Se pegan lado a lado sin separarse de más
    className = ''
}) => {
    // Devuelve la referencia del array del store (o undefined): estable mientras no cambie.
    const disasterZone = useMatchStore((s) => selectPlayerById(userId)(s)?.disaster_zone);

    // Hidratación con assets (antes se hacía en TablePage)
    const cards = useMemo(
        () => (disasterZone ?? []).map(card => ({
            ...card,
            ...getCardAssets(card.id)
        })),
        [disasterZone]
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
    const [inspectedCardId, setInspectedCardId] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Ajustes fijos para el hover en esta zona específica
    const timeToHover = 1000;
    const scaleAmount = 2;
    const hoverOffsetY = -(cardHeight); 

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width));
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Ordenamiento automático y forzoso basado en DISASTER_ORDER
    const displayedCards = React.useMemo(() => {
        return [...cards].sort((a, b) => {
            const weightA = DISASTER_ORDER.indexOf(a.type) === -1 ? 999 : DISASTER_ORDER.indexOf(a.type);
            const weightB = DISASTER_ORDER.indexOf(b.type) === -1 ? 999 : DISASTER_ORDER.indexOf(b.type);
            return weightA - weightB;
        });
    }, [cards]);

    const getSpacing = () => {
        const total = displayedCards.length;
        if (total <= 1 || containerWidth === 0) return 0;
        
        const available = containerWidth;
        const totalNaturalWidth = total * cardWidth;
        const requiredSpacing = (available - totalNaturalWidth) / (total - 1);
        
        return Math.min(requiredSpacing, maxSpacing);
    };

    const spacing = getSpacing();

    const handleMouseEnter = (id: string) => {
        setHoveredCardId(id);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setInspectedCardId(id), timeToHover);
    };

    const handleMouseLeave = () => {
        setHoveredCardId(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        setInspectedCardId(null);
    };

    return (
        <Reorder.Group
            axis="x"
            values={displayedCards}
            onReorder={() => {}} // Bloqueamos el reordenamiento manual
            ref={containerRef}
            className={`w-full h-full flex flex-row justify-start items-center relative ${className}`}
        >
            {displayedCards.map((card, index) => {
                const isInspected = inspectedCardId === card.id;

                const motionPropsForCard = {
                    layoutId: `zone-${card.id}`,
                    onMouseEnter: () => handleMouseEnter(card.id),
                    onMouseLeave: handleMouseLeave,
                    animate: {
                        scale: isInspected ? scaleAmount : 1,
                        x: 0,
                        y: isInspected ? hoverOffsetY : 0,
                        zIndex: isInspected ? 100 : index,
                    },
                    transition: { type: 'tween', ease: 'easeOut', duration: 0.2 }
                };

                return (
                    <Reorder.Item
                        key={card.id}
                        value={card}
                        id={card.id}
                        dragListener={false} // Desactivamos el drag manual forzosamente
                        className="shrink-0 relative focus:outline-none select-none"
                        style={{ 
                            marginLeft: index > 0 ? `${spacing}px` : '0px',
                            zIndex: index 
                        }}
                    >
                        {renderCard(card, index, motionPropsForCard, isInspected)}
                    </Reorder.Item>
                );
            })}
        </Reorder.Group>
    );
};
