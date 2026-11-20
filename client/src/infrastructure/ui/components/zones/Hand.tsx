import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const useContainerWidth = (ref: React.RefObject<HTMLDivElement | null>) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
    return width;
};

interface HandProps {
    cards: any[];
    onReorder: (newOrder: any[]) => void;
    renderCard: (card: any, index: number, motionProps: any) => React.ReactNode;
    // <-- NUEVO: Función para dictar si una carta está habilitada
    isCardPlayable?: (card: any) => boolean; 
    hoverMode?: 'hover-free' | 'hover-center';
    timeToHover?: number;
    scaleAmount?: number;
    cardWidth: number;
    freeHoverOffsetX?: number; 
    freeHoverOffsetY?: number;
    className?: string;
}

export const Hand: React.FC<HandProps> = ({
    cards,
    onReorder,
    renderCard,
    isCardPlayable, // <-- Recibimos la prop
    hoverMode = 'hover-free',
    timeToHover = 1000, 
    scaleAmount = 1.3,
    cardWidth,
    freeHoverOffsetX = 0,
    freeHoverOffsetY = -40,
    className = ''
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const containerWidth = useContainerWidth(containerRef);

    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
    const [inspectedCard, setInspectedCard] = useState<any | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dynamicSpacing = (() => {
        const total = cards.length;
        if (total <= 1 || containerWidth === 0) return 0;
        const usableWidth = containerWidth;
        const naturalWidth = total * cardWidth;
        const gaps = total - 1;
        const difference = usableWidth - naturalWidth;
        const spacing = difference / gaps;
        return Math.min(spacing, 5); 
    })();

    const handleMouseEnter = (card: any) => {
        setHoveredCardId(card.id);
        if (timerRef.current) clearTimeout(timerRef.current);

        if (!isDragging) {
            timerRef.current = setTimeout(() => {
                setInspectedCard(card);
            }, timeToHover);
        }
    };

    const handleMouseLeave = () => {
        setHoveredCardId(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (hoverMode === 'hover-free') setInspectedCard(null);
    };

    const handlePointerDown = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setInspectedCard(null);
    };

    const handleCloseInspection = () => setInspectedCard(null);

    useEffect(() => {
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    const inspectionLayer = (
        <AnimatePresence>
            {hoverMode === 'hover-center' && inspectedCard && !isDragging && (
                <motion.div 
                    className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                >
                    <motion.div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto" 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseInspection} 
                    />
                    <motion.div 
                        layoutId={`card-layout-${inspectedCard.id}`}
                        className="pointer-events-auto relative shadow-2xl rounded-lg"
                        transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
                    >
                        <motion.div
                            animate={{ scale: scaleAmount }} exit={{ scale: 1 }} 
                            transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
                            onClick={handleCloseInspection}
                            className="cursor-pointer w-full h-full"
                        >
                            {renderCard(inspectedCard, -1, {})} 
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <Reorder.Group
            axis="x"
            values={cards}
            onReorder={onReorder}
            ref={containerRef}
            className={`w-full h-full flex flex-row justify-center items-end pb-2 relative ${className}`}
        >
            {cards.map((card, index) => {
                // <-- EVALUACIÓN DE JUGABILIDAD
                // Si la función fue provista, la usamos. Si no, por defecto todo es true.
                const isPlayable = isCardPlayable ? isCardPlayable(card) : true;

                const isThisHovered = hoveredCardId === card.id;
                const isThisInspected = inspectedCard?.id === card.id;
                const isHoverFreeActive = isThisInspected && hoverMode === 'hover-free';
                const isHoverCenterActive = isThisInspected && hoverMode === 'hover-center';

                const motionPropsForCard = {
                    layoutId: `card-layout-${card.id}`,
                    // Bloqueamos el Hover si no es jugable
                    onMouseEnter: isPlayable ? () => handleMouseEnter(card) : undefined,
                    onMouseLeave: isPlayable ? handleMouseLeave : undefined,
                    animate: {
                        opacity: isHoverCenterActive ? 0 : 1,
                        scale: isHoverFreeActive && isPlayable ? scaleAmount : 1,
                        x: isHoverFreeActive && isPlayable ? freeHoverOffsetX : 0,
                        y: isHoverFreeActive && isPlayable ? freeHoverOffsetY : 0,
                        zIndex: isThisHovered && !isDragging && isPlayable ? 50 : index,
                        // Añadimos filtro CSS para oscurecer y ennegrecer ligeramente cartas bloqueadas
                        filter: isPlayable ? 'brightness(1) grayscale(0)' : 'brightness(0.4) grayscale(0.6)'
                    },
                    transition: { type: 'tween', ease: 'easeOut', duration: 0.25 } 
                };

                return (
                    <Reorder.Item
                        key={card.id}
                        value={card}
                        id={card.id}
                        // <-- BLOQUEO DEL ARRASTRE SI ESTÁ DESHABILITADA
                        dragListener={isPlayable} 
                        onDragStart={() => {
                            if (!isPlayable) return;
                            setIsDragging(true);
                            handlePointerDown();
                        }}
                        onDragEnd={() => setIsDragging(false)}
                        onPointerDown={isPlayable ? handlePointerDown : undefined}
                        className={`shrink-0 relative focus:outline-none select-none ${!isPlayable ? 'cursor-not-allowed' : ''}`}
                        style={{ marginRight: index < cards.length - 1 ? `${dynamicSpacing}px` : '0px' }}
                    >
                        {renderCard(card, index, motionPropsForCard)}
                    </Reorder.Item>
                );
            })}

            {typeof document !== 'undefined' && createPortal(inspectionLayer, document.body)}
            
        </Reorder.Group>
    );
};