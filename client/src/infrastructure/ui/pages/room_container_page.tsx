import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomTunnel } from '../hooks/use_room_tunnel';
import { RoomPage } from './room_page'; // Asegúrate de que las rutas coincidan con tus archivos
import { GameContainer } from './game_container';
import imagenFondo from "../../../assets/login_background.jpg";

// Traemos tu tema para que las pantallas de carga y error se vean igual de bien
const THEME = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: `url(${imagenFondo})`,
    panelBackground: "rgba(255, 255, 255, 0.95)",
    primaryColor: "#4CAF50", 
    guestColor: "#2196F3",   
    dangerColor: "#f44336",
    textColor: "#333",
    overlayColor: "rgba(0, 0, 0, 0.6)",
};

export const RoomContainer: React.FC = () => {
    const { roomCode } = useParams<{ roomCode: string }>();
    const token = sessionStorage.getItem("access_token") || "";
    const navigate = useNavigate();

    // 1. ABRIMOS EL TÚNEL AQUÍ ARRIBA
    const { roomState, gameState, isConnected, error } = useRoomTunnel(roomCode, token);

    const handleLeaveRoom = () => {
        navigate("/rooms_list", { replace: true });
    };

    // ==========================================
    // VISTA 1: ERROR HERMOSO (La sala no existe o está llena)
    // ==========================================
    if (error) {
        let errorTitle = "¡Uy! Algo salió mal";
        let errorEmoji = "⚠️";
        let errorTip = "Intenta unirte a otra partida pública o verifica el código.";

        const lowerError = error.toLowerCase();
        if (lowerError.includes("llena")) {
            errorTitle = "¡Sala Llena!";
            errorEmoji = "🚪";
            errorTip = "Esta mesa ya no tiene asientos disponibles. ¡Busca otra manada!";
        } else if (lowerError.includes("no existe") || lowerError.includes("cerrada")) {
            errorTitle = "Sala Extinta";
            errorEmoji = "☄️";
            errorTip = "Es posible que el código sea incorrecto o que el host haya cerrado la partida.";
        }

        return (
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
                backgroundImage: THEME.backgroundImage, backgroundSize: "cover", backgroundPosition: "center",
                fontFamily: THEME.fontFamily, position: "relative"
            }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: THEME.overlayColor }}></div>
                <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "16px", maxWidth: "450px", width: "90%", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", color: THEME.textColor, zIndex: 1 }}>
                    <div style={{ fontSize: "60px", marginBottom: "10px", filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.2))" }}>{errorEmoji}</div>
                    <h2 style={{ color: THEME.dangerColor, marginTop: 0, fontSize: "28px", marginBottom: "15px" }}>{errorTitle}</h2>
                    <p style={{ color: "#555", fontSize: "16px", marginBottom: "30px", lineHeight: "1.5" }}>{errorTip}</p>
                    <button onClick={handleLeaveRoom} style={{ padding: "14px 24px", cursor: "pointer", borderRadius: "8px", border: "none", background: THEME.primaryColor, color: "white", fontWeight: "bold", fontSize: "16px", width: "100%", boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)" }}>
                        Volver al Menú Principal
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // VISTA 2: PANTALLA DE CARGA (Conectando...)
    // ==========================================
    if (!isConnected || !roomState) {
        return (
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center", height: "100vh",
                backgroundImage: THEME.backgroundImage, backgroundSize: "cover", backgroundPosition: "center",
                fontFamily: THEME.fontFamily, position: "relative"
            }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }}></div>
                <div style={{ backgroundColor: THEME.panelBackground, padding: "30px 50px", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.3)", zIndex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "15px", animation: "pulse 1.5s infinite" }}>🦕</div>
                    <h2 style={{ color: THEME.textColor, margin: 0 }}>Conectando a la sala <span style={{ color: THEME.guestColor }}>{roomCode}</span>...</h2>
                    <style>{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }`}</style>
                </div>
            </div>
        );
    }

    // ==========================================
    // 3. LA MAGIA DE LA NAVEGACIÓN REACTIVA
    // ==========================================
    
    // Si la sala está en LOBBY, dibujamos la sala y le pasamos los datos
    if (roomState.room_phase === "LOBBY") {
        return <RoomPage roomState={roomState} />;
    }

    // Si la sala cambió a PLAYING, delegamos el control al GameContainer
    if (roomState.room_phase === "PLAYING") {
        return <GameContainer gameState={gameState} />;
    }

    // Fallback por si hay una fase desconocida
    return <div>Fase desconocida...</div>;
};