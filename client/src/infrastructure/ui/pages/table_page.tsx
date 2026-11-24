import React, { useState, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Card } from '../components/game_components/Card';
import { Hand } from '../components/zones/Hand';
import { DisasterZone } from '../components/zones/DisasterZone';
import { Scoreboard } from '../components/zones/ScoreBoard';
import { PlayerBoard } from '../components/zones/PlayerBoard';
import { GameTable } from '../components/zones/GameTable';

import { usePlayMainCard } from '../hooks/use_play_main_card'

// Store de la partida (ajusta la ruta a donde viva match_store.ts)
import {
    useMatchStore,
    selectPlayers,
    selectPlayerById,
    selectGamePhase,
    selectTimeLeft,
} from '../hooks/match_store';

// Diccionario de cartas (la mano local sigue hidratándose aquí porque Hand recibe `cards` por props)
import { getCardAssets } from '../dicts/cards_dict';

const useContainerSize = (ref: React.RefObject<HTMLDivElement | null>) => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setSize({ width, height });
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
    return size;
};

export const TablePage: React.FC = () => {
    const handRef = useRef<HTMLDivElement>(null);
    const disasterRef = useRef<HTMLDivElement>(null);
    const scoreRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    const handSize = useContainerSize(handRef);
    const disasterSize = useContainerSize(disasterRef);
    const tableSize = useContainerSize(tableRef);

    const handCardHeight = Math.max(100, Math.round(handSize.height * 0.85)); 
    const handCardWidth = Math.round(handCardHeight / 1.4); 

    const disasterCardHeight = Math.max(80, Math.round(disasterSize.height * 0.85));
    const disasterCardWidth = Math.round(disasterCardHeight / 1.4);
    const localUserId = sessionStorage.getItem("user_id")

    // ==========================================
    // LECTURA DEL STORE
    // ==========================================
    const { gamePhase, serverTimeLeft } = useMatchStore(
        useShallow((s) => ({
            gamePhase: selectGamePhase(s) ?? '',
            serverTimeLeft: selectTimeLeft(s),
        }))
    );
    // Primitivo: solo para el fallback del id local.
    const firstPlayerId = useMatchStore((s) => selectPlayers(s)[0]?.user_id ?? '');

    const safeLocalUserId = localUserId || firstPlayerId;
    const localPlayer = useMatchStore(selectPlayerById(safeLocalUserId));

    // ==========================================
    // 1. CRONÓMETRO ROBUSTO (Inmune a lag)
    // ==========================================
    const [timeLeft, setTimeLeft] = useState(serverTimeLeft);
    const localEndTimeRef = useRef<number | null>(null);
    const currentPhaseRef = useRef<string>(gamePhase);

    useEffect(() => {
        if (gamePhase !== currentPhaseRef.current || !localEndTimeRef.current) {
            currentPhaseRef.current = gamePhase;
            // Si el tiempo es infinito, no calculamos una fecha de fin
            if (serverTimeLeft === -1) {
                localEndTimeRef.current = null;
                setTimeLeft(-1);
            } else {
                localEndTimeRef.current = Date.now() + (serverTimeLeft * 1000);
            }
        }

        const updateTimer = () => {
            // Si el juego nos mandó tiempo infinito, ignoramos la resta matemática
            if (serverTimeLeft === -1) {
                setTimeLeft(-1);
                return;
            }

            if (localEndTimeRef.current) {
                const remaining = Math.max(0, Math.floor((localEndTimeRef.current - Date.now()) / 1000));
                setTimeLeft(remaining);
            }
        };

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, [gamePhase, serverTimeLeft]);

    const isShuffling = gamePhase === "INITIAL_SHUFFLE";

    // ==========================================
    // 2. HIDRATACIÓN DE LA MANO LOCAL
    // ==========================================
    // (GameTable, PlayerSeat, PlayedCardsZone, CenterTableZone y DeckPile hidratan lo suyo
    //  leyendo del store; DisasterZone también.)

    const [localHandCards, setLocalHandCards] = useState<any[]>([]);

    useEffect(() => {
        if (localPlayer) {
            const hydratedHand = localPlayer.hand.map(card => ({
                ...card,
                ...getCardAssets(card.id)
            }));
            setLocalHandCards(hydratedHand);
        }
    }, [localPlayer?.hand]);

    const { playMainCard } = usePlayMainCard();
    const handlePlayCard = (card_id: string) => {
        playMainCard(card_id);
    };

    const [isDisasterPhase, setIsDisasterPhase] = useState(true);

    // ==========================================
    // 3. LÓGICA DE CARTAS HABILITADAS (BUSINESS RULES)
    // ==========================================
    const evaluateCardPlayability = (card: any): boolean => {
        const phase = gamePhase;
        
        // Comprueba si es instantánea usando el type proveniente del servidor (CardDTO)
        const isInstant = card.type === "INSTANT";

        // Caso 1: Solo permitir cartas de puntos/desventaja en estas fases
        if (phase === "PLAY_POINT_CARDS" || phase === "PLAY_SUDDEN_DEATH_CARDS") {
            return !isInstant;
        }

        // Caso 2: Solo permitir jugar cartas instantáneas
        if (phase === "PLAY_INSTANT_CARDS") {
            return isInstant;
        }

        // Caso 3: En cualquier otra fase (Ej. RESOLVING_EFFECTS, CALCULATE_SCORE, etc) la mano entera se bloquea
        return false;
    };

    return (
        <div className="relative flex h-dvh w-full p-4 gap-4 bg-[#111] text-white box-border min-h-0 overflow-hidden">
            
            {/* Cortina de Animación */}
            <div className={`absolute inset-0 z-50 bg-[#111]/95 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none
                ${isShuffling ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-6xl md:text-8xl animate-bounce mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">🃏</div>
                <h2 className="text-2xl md:text-4xl font-bold text-white tracking-widest uppercase animate-pulse">Barajando Cartas...</h2>
                <p className="mt-4 text-[#888] font-mono">{timeLeft}s</p>
            </div>

            {/* COLUMNA IZQUIERDA */}
            <div className="flex-[6] flex flex-col gap-4 min-w-0 min-h-0">
                
                {/* 1. MESA DE JUEGO */}
                <div ref={tableRef} className="flex-[7] bg-[#1a472a] rounded-2xl border-[3px] border-[#2a5a3a] relative min-h-0">
                    {tableSize.width > 0 && (
                        <GameTable 
                            localUserId={safeLocalUserId} 
                            tableWidth={tableSize.width} 
                            tableHeight={tableSize.height}
                        />
                    )}
                </div>
                
                {/* 2. ZONAS PERSONALES */}
                <div className='flex-[3] bg-[#222] rounded-2xl p-4 border border-[#333] relative flex flex-row gap-6 min-h-0'>
                    <div className='flex-[7] flex flex-col min-w-0'>
                        <h3 className="text-xs md:text-sm text-[#aaa] uppercase tracking-[1px] border-b border-[#444] pb-1 mb-2 shrink-0">Tu Mano</h3>
                        <div ref={handRef} className="w-full h-full flex justify-center items-end">
                            {handSize.height > 0 && (
                                <Hand 
                                    cards={localHandCards} 
                                    onReorder={setLocalHandCards} 
                                    isCardPlayable={evaluateCardPlayability} 
                                    hoverMode="hover-center" 
                                    timeToHover={1500} 
                                    scaleAmount={4} 
                                    cardWidth={handCardWidth} 
                                    renderCard={(card, index, motionProps) => {
                                        // Evaluamos la carta justo antes de renderizarla
                                        const isPlayable = evaluateCardPlayability(card);

                                        return (
                                            <Card 
                                                id={card.id} 
                                                frontImage={card.frontImage} 
                                                backImage={card.backImage} 
                                                height={handCardHeight} 
                                                onSelect={isPlayable ? () => handlePlayCard(card.id) : undefined} 
                                                {...motionProps} 
                                            />
                                        );
                                    }} 
                                />
                            )}
                        </div>
                    </div>
                    <div className="w-px bg-[#444] h-full rounded-full shrink-0"></div>
                    <div className='flex-[3] flex flex-col min-w-0'>
                        <h3 className="text-xs md:text-sm text-[#aaa] uppercase tracking-[1px] border-b border-[#444] pb-1 mb-2 text-center shrink-0">Desastres</h3>
                        <div ref={disasterRef} className="w-full h-full">
                            {disasterSize.height > 0 && (
                                <DisasterZone 
                                    userId={safeLocalUserId}
                                    cardWidth={disasterCardWidth} 
                                    cardHeight={disasterCardHeight} 
                                    renderCard={(card, index, motionProps) => (
                                        <Card 
                                            id={card.id} 
                                            type={card.uiType as any} 
                                            frontImage={card.frontImage} 
                                            backImage={card.backImage} 
                                            height={disasterCardHeight} 
                                            faceUp={true} 
                                            {...motionProps} 
                                        />
                                    )} 
                                />
                            )}
                        </div>
                    </div>                
                </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="flex-[3.5] flex flex-col gap-4 min-w-[280px] max-w-[450px] min-h-0">
                <div className="flex-[5] flex flex-row gap-4 min-h-0">
                    <div className="flex-[4] bg-[#222] rounded-xl p-3 flex flex-col border border-[#333] min-h-0 min-w-0">
                        <h3 className="text-xs md:text-sm text-[#aaa] uppercase border-b border-[#444] pb-1 mb-2 shrink-0">Puntuación</h3>
                        <div ref={scoreRef} className="flex-1 w-full min-h-0">
                            <Scoreboard localUserId={safeLocalUserId}/>
                        </div>
                    </div>
                    <div className="flex-[6] flex flex-col gap-4 min-w-0 min-h-0">
                        <button className="flex-none w-full p-2 md:p-3 text-sm md:text-base bg-[#8B0000] rounded-lg font-bold hover:bg-[#a00000] transition-colors shrink-0" 
                            onClick={() => setIsDisasterPhase(!isDisasterPhase)}>
                            {isDisasterPhase ? "Voltear (Frente)" : "Voltear (Dorso)"}
                        </button>
                        <div className="flex-1 bg-[#222] rounded-xl p-3 flex flex-col border border-[#333] min-h-0 min-w-0">
                            <h3 className="text-xs md:text-sm text-[#aaa] uppercase border-b border-[#444] pb-1 mb-2 shrink-0">Chat</h3>
                            <div className="flex-1 border border-dashed border-[#444] rounded-lg min-h-0"></div>
                        </div>
                    </div>
                </div>
                <div className="flex-[4] bg-[#222] rounded-xl p-3 flex flex-col border border-[#333] min-h-0 shrink-0">
                    <h3 className="text-xs md:text-sm text-[#aaa] uppercase border-b border-[#444] pb-1 mb-2 shrink-0">Tu tablero</h3>
                    <div className="flex-1 w-full min-h-0">
                        {localPlayer && (
                            <PlayerBoard userId={safeLocalUserId} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
