import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRoomsList } from "../hooks/use_rooms_list";
import { useCreateRoom } from "../hooks/use_create_room";
import imagenFondo from "../../../assets/login_background.jpg"; 

const THEME = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: `url(${imagenFondo})`,
    formBackground: "rgba(255, 255, 255, 0.95)",
    primaryColor: "#4CAF50",
    guestColor: "#2196F3",
    dangerColor: "#f44336",
    overlayColor: "rgba(0, 0, 0, 0.75)",
    textColor: "#333",
    tableHeaderBg: "#f2f2f2"
};

export const RoomsListPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem("access_token") || "";

    const { rooms, isLoading, error } = useRoomsList(token);
    const { createRoom, isLoading: isCreating, error: createError } = useCreateRoom(token);

    // --- ESTADOS PARA EL MODAL DE UNIRSE ---
    const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
    const [codeBoxes, setCodeBoxes] = useState<string[]>(Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login", { replace: true });
    };

    // --- CONEXIÓN DE LOS HOOKS CON LA NAVEGACIÓN ---
    const handleJoinRoom = (roomCode: string) => {
        // Redirige al jugador a la vista de la mesa
        navigate(`/room/${roomCode}`);
    };

    const handleCreateRoomClick = async () => {
        const code = await createRoom();
        if (code) {
            navigate(`/room/${code}`);
        }
    };

    // --- LÓGICA DEL INPUT DE 6 CARACTERES (ESTILO STEAM) ---
    const handleBoxChange = (index: number, value: string) => {
        const val = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!val && value !== "") return; 

        const newCode = [...codeBoxes];
        newCode[index] = val.slice(-1); 
        setCodeBoxes(newCode);

        if (index < 5 && val) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            const newCode = [...codeBoxes];
            if (newCode[index] !== "") {
                newCode[index] = "";
                setCodeBoxes(newCode);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                newCode[index - 1] = "";
                setCodeBoxes(newCode);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("Text").toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        
        if (pastedData) {
            const newCode = [...codeBoxes];
            for (let i = 0; i < pastedData.length; i++) {
                newCode[i] = pastedData[i];
            }
            setCodeBoxes(newCode);
            
            const nextFocus = Math.min(pastedData.length, 5);
            inputRefs.current[nextFocus]?.focus();
        }
    };

    const submitManualJoin = () => {
        const fullCode = codeBoxes.join("");
        if (fullCode.length === 6) {
            setShowJoinModal(false);
            handleJoinRoom(fullCode);
            setCodeBoxes(Array(6).fill("")); 
        }
    };

    return (
        <div style={{
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
            minHeight: "100vh", backgroundImage: THEME.backgroundImage,
            backgroundSize: "cover", backgroundPosition: "center",
            fontFamily: THEME.fontFamily, position: "relative", padding: "20px", boxSizing: "border-box"
        }}>
            
            <button 
                onClick={handleLogout}
                style={{
                    position: "absolute", top: "20px", right: "20px",
                    padding: "10px 18px", backgroundColor: THEME.dangerColor, color: "white",
                    border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold",
                    cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
            >
                🚪 Cerrar Sesión
            </button>

            {/* --- PANEL CENTRAL DE SALAS --- */}
            <div style={{
                width: "100%", maxWidth: "700px", padding: "30px",
                backgroundColor: THEME.formBackground, borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)", color: THEME.textColor,
                display: "flex", flexDirection: "column", minHeight: "500px" 
            }}>
                
                <h2 style={{ textAlign: "center", marginBottom: "5px" }}>Salas Disponibles</h2>
                <p style={{ textAlign: "center", fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                    Selecciona una sala activa para unirte a la partida.
                </p>

                {createError && (
                    <div style={{ color: "white", backgroundColor: THEME.dangerColor, padding: "10px", borderRadius: "8px", textAlign: "center", marginBottom: "15px", fontWeight: "bold" }}>
                        ⚠️ {createError}
                    </div>
                )}

                {isLoading && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold" }}>
                        🦕 Buscando dinosaurios activos...
                    </div>
                )}

                {error && !isLoading && (
                    <div style={{ color: "white", backgroundColor: THEME.dangerColor, padding: "15px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                        ⚠️ {error}
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        <div style={{ 
                            flex: 1, 
                            maxHeight: "350px", 
                            overflowY: "auto", 
                            overflowX: "auto",
                            border: "1px solid #ddd", 
                            borderRadius: "8px",
                            backgroundColor: "white",
                            marginBottom: "20px"
                        }}>
                            {rooms.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                                    <div style={{ fontSize: "50px", marginBottom: "15px" }}>☄️</div>
                                    <h3 style={{ marginTop: 0, color: "#555" }}>¡Todos los dinosaurios están extintos!</h3>
                                    <p style={{ color: "#777", fontSize: "15px", maxWidth: "400px", margin: "0 auto" }}>
                                        No hay ninguna sala pública activa en este momento. Inicia tu propia partida o únete a una sala privada con código.
                                    </p>
                                </div>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                    <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                        <tr style={{ backgroundColor: THEME.tableHeaderBg, borderBottom: "2px solid #ddd" }}>
                                            <th style={{ padding: "12px 15px", fontWeight: "bold" }}>Host</th>
                                            <th style={{ padding: "12px 15px", fontWeight: "bold" }}>Jugadores</th>
                                            <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: "bold" }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room) => (
                                            <tr key={room.room_code} style={{ borderBottom: "1px solid #eee" }}>
                                                <td style={{ padding: "14px 15px", fontWeight: "500" }}>👤 {room.host_username}</td>
                                                <td style={{ padding: "14px 15px" }}>
                                                    <span style={{ 
                                                        backgroundColor: room.player_count >= room.max_players ? "#ffebee" : "#e8f5e9",
                                                        color: room.player_count >= room.max_players ? THEME.dangerColor : THEME.primaryColor,
                                                        padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "14px"
                                                    }}>
                                                        {room.player_count} / {room.max_players}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "14px 15px", textAlign: "right" }}>
                                                    <button
                                                        onClick={() => handleJoinRoom(room.room_code)}
                                                        disabled={room.player_count >= room.max_players}
                                                        style={{
                                                            padding: "8px 16px",
                                                            background: room.player_count >= room.max_players ? "#ccc" : THEME.guestColor,
                                                            color: "white", border: "none", borderRadius: "4px", fontSize: "14px",
                                                            fontWeight: "bold", cursor: room.player_count >= room.max_players ? "not-allowed" : "pointer"
                                                        }}
                                                    >
                                                        {room.player_count >= room.max_players ? "Llena" : "Unirse"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* --- BOTONES DE ACCIÓN GLOBALES --- */}
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "15px" }}>
                            <button 
                                onClick={() => setShowJoinModal(true)}
                                style={{ flex: 1, padding: "12px", background: "white", color: THEME.guestColor, border: `2px solid ${THEME.guestColor}`, borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
                            >
                                🔑 Código Privado
                            </button>
                            
                            <button 
                                onClick={handleCreateRoomClick}
                                disabled={isCreating}
                                style={{ flex: 1, padding: "12px", background: isCreating ? "#ccc" : THEME.primaryColor, color: "white", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: isCreating ? "wait" : "pointer" }}
                            >
                                {isCreating ? "Creando..." : "➕ Crear Sala"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* --- MODAL PARA CÓDIGO --- */}
            {showJoinModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: THEME.overlayColor, display: "flex",
                    justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white", padding: "40px", borderRadius: "12px",
                        maxWidth: "450px", width: "90%", boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                        color: THEME.textColor, textAlign: "center"
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: "24px", color: THEME.guestColor }}>Unirse a Sala Privada</h3>
                        <p style={{ fontSize: "15px", color: "#666", marginBottom: "30px" }}>
                            Ingresa el código de 6 dígitos que te proporcionó el host de la partida.
                        </p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
                            {codeBoxes.map((value, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={value}
                                    onChange={(e) => handleBoxChange(index, e.target.value)}
                                    onKeyDown={(e) => handleBoxKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    style={{
                                        width: "45px", height: "55px", fontSize: "24px", fontWeight: "bold",
                                        textAlign: "center", textTransform: "uppercase",
                                        border: `2px solid ${value ? THEME.guestColor : "#ccc"}`,
                                        borderRadius: "8px", outline: "none",
                                        backgroundColor: "#fafafa", transition: "border-color 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = THEME.guestColor}
                                    onBlur={(e) => e.target.style.borderColor = value ? THEME.guestColor : "#ccc"}
                                />
                            ))}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", gap: "15px" }}>
                            <button 
                                onClick={() => {
                                    setShowJoinModal(false);
                                    setCodeBoxes(Array(6).fill(""));
                                }} 
                                style={{ flex: 1, padding: "12px", backgroundColor: "#eee", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
                            >
                                Cancelar
                            </button>
                            
                            <button 
                                onClick={submitManualJoin} 
                                disabled={codeBoxes.join("").length !== 6}
                                style={{ flex: 1, padding: "12px", backgroundColor: THEME.guestColor, color: "white", border: "none", borderRadius: "6px", cursor: codeBoxes.join("").length !== 6 ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px", opacity: codeBoxes.join("").length !== 6 ? 0.6 : 1 }}
                            >
                                Entrar a la Mesa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};