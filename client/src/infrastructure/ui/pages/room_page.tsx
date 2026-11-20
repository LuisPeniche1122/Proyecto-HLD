import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChangeRoomConfig } from "../hooks/use_change_room_config";
import { useChangeGameConfig } from "../hooks/use_change_game_config";
import { useToggleReady } from "../hooks/use_toggle_ready";
import imagenFondo from "../../../assets/login_background.jpg";
import { useKickPlayer } from "../hooks/use_kick_player";
import { useStartGame } from "../hooks/use_start_game";
import { useSendChatMessage } from "../hooks/use_send_chat_message";
import { sharedWsClient } from "../../network/web_socket_client"; 
import type { RoomStateDTO } from "../../../domain/dtos/room_dtos";

interface RoomPageProps {
    roomState: RoomStateDTO;
}

export const RoomPage: React.FC<RoomPageProps> = ({ roomState }) => {
    const navigate = useNavigate();
    
    // --- HOOKS DE ACCIONES ---
    const { changeRoomConfig } = useChangeRoomConfig();
    const { changeGameConfig } = useChangeGameConfig();
    const { toggleReady } = useToggleReady();
    const { sendChatMessage } = useSendChatMessage();
    const { kickPlayer } = useKickPlayer();
    const { startGame } = useStartGame();

    const [chatInput, setChatInput] = useState("");

    // --- IDENTIDAD Y PERMISOS ---
    const localUserId = sessionStorage.getItem("user_id") || "";
    const localUsername = sessionStorage.getItem("username") || "Usuario Desconocido";
    
    const localPlayer = roomState.players.find(p => p.user_id === localUserId);
    const isLocalUserHost = localPlayer?.is_host || false;
    const isLocalUserReady = localPlayer?.is_ready || false;
    const minAllowedPlayers = Math.max(2, roomState.players.length);
    const hasEnoughPlayers = roomState.players.length >= 2;
    const areAllGuestsReady = roomState.players.every(p => p.is_host || p.is_ready);
    const canStartGame = hasEnoughPlayers && areAllGuestsReady;

    // --- EFECTO DE DETECCIÓN DE EXPULSIÓN ---
    useEffect(() => {
        if (!localPlayer) {
            sharedWsClient.disconnect();
            navigate("/rooms_list", { replace: true });
        }
    }, [localPlayer, navigate]);

    // --- HANDLERS PARA ENVIAR ACCIONES ---
    const handleLeaveRoom = () => {
        sharedWsClient.disconnect();
        navigate("/rooms_list", { replace: true });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim()) {
            sendChatMessage(chatInput);
            setChatInput("");
        }
    };

    const handlePrivacyToggle = () => {
        if (!isLocalUserHost) return;
        changeRoomConfig(roomState.max_players, !roomState.is_private);
    };

    const handleMaxPlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isLocalUserHost) return;
        changeRoomConfig(parseInt(e.target.value), roomState.is_private);
    };

    const handleTimerChange = (key: 'select_card_phase_timer' | 'instant_card_phase_timer', value: number) => {
        if (!isLocalUserHost) return;
        changeGameConfig({
            ...roomState.game_config,
            [key]: value
        });
    };

    const handleExpansionToggle = (key: 'use_dating_disasters' | 'use_perils_of_puberty') => {
        if (!isLocalUserHost) return;
        changeGameConfig({
            ...roomState.game_config,
            [key]: !roomState.game_config[key]
        });
    };

    const handleAddBot = () => {
        if (!isLocalUserHost || roomState.is_full) return;
        console.log("Añadir bot...");
    };

    // ==========================================
    // VISTA 3: EL LOBBY DE LA MESA (100vh Responsivo)
    // ==========================================
    return (
        <div 
            className="flex flex-col h-screen w-full bg-cover bg-center font-sans p-2 md:p-4 box-border"
            style={{ backgroundImage: `url(${imagenFondo})` }}
        >
            {/* ENCABEZADO SUPERIOR (Fijo en la parte superior) */}
            <div className="flex-none flex justify-between items-center bg-white/95 px-4 md:px-6 py-2 md:py-3 rounded-xl mb-3 shadow-md">
                <h1 className="m-0 text-gray-800 text-lg md:text-xl font-semibold">
                    Sala: <span className="tracking-widest text-green-500 font-bold">{roomState.room_code}</span>
                </h1>
                <button 
                    onClick={handleLeaveRoom} 
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg font-bold text-sm cursor-pointer transition-colors"
                >
                    Abandonar Sala
                </button>
            </div>

            {/* CONTENEDOR PRINCIPAL - Reparte el espacio disponible exacto usando min-h-0 */}
            <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 w-full max-w-7xl mx-auto min-h-0">
                
                {/* COLUMNA IZQ: JUGADORES (Compacta en móvil, columna en escritorio) */}
                <div className="flex flex-col shrink-0 lg:w-[280px] xl:w-[320px] bg-white/95 rounded-xl p-3 shadow-md h-fit lg:h-full min-h-0">
                    <h3 className="flex-none m-0 mb-3 border-b border-gray-200 pb-2 text-base md:text-lg font-semibold text-gray-700">
                        Jugadores ({roomState.players.length}/{roomState.max_players})
                    </h3>
                    
                    {/* Grid dinámico: 2 col en móvil para ahorrar espacio vertical, 1 col en Desktop */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 overflow-y-auto pr-1">
                        {roomState.players.map((player) => (
                            <div 
                                key={player.user_id} 
                                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-gray-50 rounded-lg border-l-[3px] ${player.is_host ? 'border-green-500' : 'border-blue-500'}`}
                            >
                                <span className="font-bold text-gray-700 truncate w-full text-xs md:text-sm">
                                    {player.username} {player.user_id === localUserId ? "(Tú)" : ""}
                                </span>
                                
                                <div className="flex items-center gap-1 mt-1 sm:mt-0">
                                    {!player.is_host && (
                                        <span title={player.is_ready ? "¡Listo!" : "No está listo"} className="text-sm md:text-base">
                                            {player.is_ready ? "✅" : "❌"}
                                        </span>
                                    )}
                                    {isLocalUserHost && !player.is_host && (
                                        <button 
                                            onClick={() => kickPlayer(player.user_id)}
                                            className="bg-transparent border-none cursor-pointer text-sm md:text-base p-1 hover:scale-110 transition-transform"
                                            title="Expulsar jugador"
                                        >
                                            👢
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {Array.from({ length: roomState.max_players - roomState.players.length }).map((_, idx) => (
                            <div 
                                key={`empty-${idx}`} 
                                className="p-2 border border-dashed border-gray-300 rounded-lg text-gray-400 text-center text-xs md:text-sm font-bold flex items-center justify-center"
                            >
                                Esperando...
                            </div>
                        ))}
                    </div>

                    {isLocalUserHost && !roomState.is_full && (
                        <button 
                            onClick={handleAddBot}
                            className="flex-none mt-2 w-full p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 border-none rounded-lg text-xs md:text-sm font-bold cursor-pointer transition-colors"
                        >
                            🤖 Agregar Bot
                        </button>
                    )}
                </div>

                {/* COLUMNA CENTRAL: CONFIGURACIÓN (Toma todo el espacio restante en móvil y SCROLLEA) */}
                <div className="flex flex-col flex-1 bg-white/95 rounded-xl p-3 md:p-5 shadow-md min-h-0">
                    <h3 className="flex-none m-0 mb-3 border-b border-gray-200 pb-2 text-base md:text-lg font-semibold text-gray-700">
                        Ajustes de la Mesa
                    </h3>
                    
                    {/* SCROLL INTERNO SOLO AQUÍ COMO PEDISTE */}
                    <div className={`flex-1 overflow-y-auto pr-1 md:pr-2 flex flex-col gap-4 ${!isLocalUserHost ? 'opacity-70' : 'opacity-100'}`}>
                        
                        {/* 1. Configuración de la Sala */}
                        <div className="p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="m-0 mb-3 text-gray-600 text-sm font-semibold">1. Configuración de la Sala</h4>
                            <div className="flex gap-4 items-center">
                                <button 
                                    onClick={handlePrivacyToggle}
                                    disabled={!isLocalUserHost}
                                    className={`flex-none flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl border-none text-white shadow-sm transition-all ${roomState.is_private ? 'bg-green-500' : 'bg-blue-500'} ${isLocalUserHost ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}`}
                                >
                                    <span className="text-2xl md:text-3xl leading-none mb-1">🕵️</span>
                                    <span className="text-[10px] md:text-xs font-bold leading-none text-center">Privada</span>
                                </button>

                                <div className="flex-1">
                                    <label className="block font-bold mb-1 md:mb-2 text-xs md:text-sm text-gray-700">
                                        Límite de Jugadores: <span className="text-green-500 text-base">{roomState.max_players}</span>
                                    </label>
                                    <input 
                                        type="range" min={minAllowedPlayers} max="6" 
                                        disabled={!isLocalUserHost}
                                        value={roomState.max_players}
                                        onChange={handleMaxPlayersChange}
                                        className={`w-full ${isLocalUserHost ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Configuración del Juego */}
                        <div className="p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="m-0 mb-3 text-gray-600 text-sm font-semibold">2. Configuración del Juego</h4>
                            
                            <div className="mb-3">
                                <label className="block text-xs md:text-sm font-bold mb-1.5 text-gray-700">⏱️ Tiempo para jugar una carta</label>
                                <div className="flex gap-1.5 md:gap-2">
                                    {[30, 60, 120, -1].map((val) => (
                                        <button 
                                            key={`timer1-${val}`}
                                            onClick={() => handleTimerChange('select_card_phase_timer', val)}
                                            disabled={!isLocalUserHost}
                                            className={`flex-1 p-1.5 md:p-2 rounded-lg text-xs md:text-sm font-bold border-none transition-colors ${isLocalUserHost ? 'cursor-pointer' : 'cursor-not-allowed'} ${roomState.game_config.select_card_phase_timer === val ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            {val === -1 ? 'Sin límite' : `${val}s`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs md:text-sm font-bold mb-1.5 text-gray-700">⚡ Tiempo para jugar instantáneas</label>
                                <div className="flex gap-1.5 md:gap-2">
                                    {[15, 60, -1].map((val) => (
                                        <button 
                                            key={`timer2-${val}`}
                                            onClick={() => handleTimerChange('instant_card_phase_timer', val)}
                                            disabled={!isLocalUserHost}
                                            className={`flex-1 p-1.5 md:p-2 rounded-lg text-xs md:text-sm font-bold border-none transition-colors ${isLocalUserHost ? 'cursor-pointer' : 'cursor-not-allowed'} ${roomState.game_config.instant_card_phase_timer === val ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            {val === -1 ? 'Sin límite' : `${val}s`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className="block text-xs md:text-sm font-bold mb-1.5 text-gray-700">📦 Expansiones Activas</label>
                            <div className="flex flex-row gap-2 md:gap-3">
                                <button 
                                    onClick={() => handleExpansionToggle('use_dating_disasters')}
                                    disabled={!isLocalUserHost}
                                    className={`flex-1 flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border-none text-white shadow-sm transition-colors ${roomState.game_config.use_dating_disasters ? 'bg-green-500' : 'bg-blue-500'} ${isLocalUserHost ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}`}
                                >
                                    <span className="text-xl md:text-2xl mb-1">💖</span>
                                    <span className="text-[9px] md:text-xs font-bold text-center leading-tight">Dating Disasters</span>
                                </button>

                                <button 
                                    onClick={() => handleExpansionToggle('use_perils_of_puberty')}
                                    disabled={!isLocalUserHost}
                                    className={`flex-1 flex flex-col items-center justify-center p-2 md:p-3 rounded-xl border-none text-white shadow-sm transition-colors ${roomState.game_config.use_perils_of_puberty ? 'bg-green-500' : 'bg-blue-500'} ${isLocalUserHost ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}`}
                                >
                                    <span className="text-xl md:text-2xl mb-1">🩲</span>
                                    <span className="text-[9px] md:text-xs font-bold text-center leading-tight">Perils of Puberty</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* BOTÓN INFERIOR DE ACCIÓN (INICIAR / LISTO) (Fijo al fondo) */}
                    <div className="flex-none mt-3 pt-3 border-t border-gray-200">
                        {isLocalUserHost ? (
                            <button 
                                onClick={startGame}
                                disabled={!canStartGame} 
                                className={`w-full p-3 md:p-4 border-none rounded-lg text-white text-sm md:text-base font-bold shadow-md transition-all ${!canStartGame ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 cursor-pointer'}`}
                            >
                                {!hasEnoughPlayers 
                                    ? "⏳ Esperando jugadores..." 
                                    : !areAllGuestsReady 
                                        ? "⏳ Esperando confirmaciones..." 
                                        : "🚀 Iniciar Partida"}
                            </button>
                        ) : (
                            <button 
                                onClick={toggleReady} 
                                className={`w-full p-3 md:p-4 border-none rounded-lg text-white text-sm md:text-base font-bold shadow-md cursor-pointer transition-colors hover:opacity-90 ${isLocalUserReady ? 'bg-red-500' : 'bg-blue-500'}`}
                            >
                                {isLocalUserReady ? "❌ Cancelar" : "✔️ Estoy Listo"}
                            </button>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: CHAT (Fija en móvil a 20vh para encajar perfecto) */}
                <div className="flex flex-col shrink-0 h-[20vh] min-h-[140px] lg:min-h-0 lg:h-full lg:w-[280px] xl:w-[320px] bg-white/95 rounded-xl p-3 shadow-md min-h-0">
                    <h3 className="flex-none m-0 mb-2 border-b border-gray-200 pb-2 text-base md:text-lg font-semibold text-gray-700">Chat</h3>
                    
                    <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                        {roomState.chat_history.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-400 text-xs md:text-sm text-center m-0">Sé el primero en saludar...</p>
                            </div>
                        ) : (
                            roomState.chat_history.map((msg, idx) => (
                                <div key={`msg-${idx}`} className="mb-1.5 break-words text-xs md:text-sm leading-tight">
                                    <span className={`font-bold ${msg.user === localUsername ? 'text-green-500' : 'text-gray-600'}`}>
                                        {msg.user}: 
                                    </span>
                                    <span className="text-gray-800 ml-1">{msg.text}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex-none flex gap-1.5">
                        <input 
                            type="text" 
                            placeholder="Mensaje..." 
                            value={chatInput} 
                            onChange={(e) => setChatInput(e.target.value)} 
                            className="flex-1 p-2 text-xs md:text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 transition-colors h-8 md:h-10 box-border" 
                        />
                        <button 
                            type="submit" 
                            className="px-3 h-8 md:h-10 bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg font-bold cursor-pointer transition-colors text-xs md:text-sm flex items-center justify-center"
                        >
                            ➤
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};