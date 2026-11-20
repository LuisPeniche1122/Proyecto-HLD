import React from 'react';
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion';

export type CardType = 
    // Cartas Jugables
    | 'tool'
    | 'instant'
    // Cartas de Desastre
    | 'disaster-predator'
    | 'disaster-natural'
    | 'disaster-emotional'
    | 'disaster-meteore'
    | 'hidden'
    // Por defecto / Genérico
    | 'unknown';

export interface CardProps extends Omit<HTMLMotionProps<"div">, "id" | "onSelect"> {
    id: string;
    type?: CardType;
    frontImage?: string; // Opcional por si no carga
    backImage?: string;
    faceUp?: boolean;
    onSelect?: (id: string) => void;
    className?: string;
    height?: number; 
    children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    id,
    type = 'unknown',
    frontImage = 'https://placehold.co/400x560/222/fff?text=DINO+FRONT',
    backImage = 'https://placehold.co/400x560/222/fff?text=DINO+BACK',
    faceUp = true,
    className = '',
    height, // Extraemos la altura
    children,
    onSelect,
    ...motionProps // <-- Aquí viajan el onMouseEnter y el layoutId de la Mano
}) => {
    return (
        <motion.div 
            id={id}
            data-card-type={type}
            // Mantenemos el aspect-ratio. Si el padre envía una clase como w-24, la usa.
            className={`relative aspect-[1/1.4] rounded-lg ${onSelect ? 'cursor-pointer' : ''} ${className}`}
            style={{ 
                perspective: 1000,
                // Si el padre pasó una altura exacta (ej. 150), forzamos ese alto.
                // El aspect-ratio calculará el ancho solo.
                height: height ? `${height}px` : undefined 
            }}
            onClick={() => onSelect && onSelect(id)}
            // ESPARCIMOS TODO EL MOTION AL DIV RAÍZ (Crucial para el Hover)
            {...motionProps} 
        >
            <motion.div
                className="w-full h-full rounded-lg shadow-xl"
                animate={{ rotateY: faceUp ? 0 : 180 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* 1. CARA FRONTAL */}
                <div 
                    className="absolute inset-0 w-full h-full rounded-lg overflow-hidden border-2 border-[#444]"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <img 
                        src={frontImage} 
                        alt={`Card front`} 
                        // pointer-events-none es vital para que la imagen no robe los eventos del ratón
                        className="w-full h-full object-cover pointer-events-none" 
                    />
                    {children && <div className="absolute inset-0 z-10 pointer-events-none">{children}</div>}
                </div>

                {/* 2. REVERSO */}
                <div 
                    className="absolute inset-0 w-full h-full rounded-lg overflow-hidden border-2 border-[#222]"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <img src={backImage} alt={`Card back`} className="w-full h-full object-cover pointer-events-none" />
                </div>
            </motion.div>
        </motion.div>
    );
};