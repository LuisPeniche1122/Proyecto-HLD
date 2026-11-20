import React, { useState} from "react";
import { useNavigate } from "react-router-dom"; // <-- 1. Importamos el hook
import { useLoginUser } from "../hooks/use_login_user";
import { useAskForPasswordChange } from "../hooks/use_ask_for_password_change";
import imagenFondo from "../../../assets/login_background.jpg";

const THEME = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: `url(${imagenFondo})`,
    formBackground: "rgba(255, 255, 255, 0.95)",
    primaryColor: "#4CAF50",
    guestColor: "#2196F3",
    dangerColor: "#f44336",
    overlayColor: "rgba(0, 0, 0, 0.7)",
    textColor: "#333",
    successColor: "#2e7d32" // Añadimos color de éxito
};

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const { 
        login, 
        loginAsGuest, 
        isLoading: isLoginLoading, 
        error: loginError, 
        successMessage: loginSuccess
    } = useLoginUser();
    
    const { 
        askForChange, 
        isLoading: isForgotLoading, 
        error: forgotError, 
        successMessage: forgotSuccess,
        resetState: resetForgotState
    } = useAskForPasswordChange();
    
    const [formData, setFormData] = useState({ identity: "", password: "" });
    const [showGuestModal, setShowGuestModal] = useState<boolean>(false);
    const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
    const [forgotIdentifier, setForgotIdentifier] = useState<string>("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userData = await login(formData);
        if (userData) {
            sessionStorage.setItem("access_token", userData.access_token);
            sessionStorage.setItem("username", userData.username);
            sessionStorage.setItem("user_id", userData.user_id);
        // Redirección blindada que no depende del ciclo de vida de React
            setTimeout(() => {
                navigate("/rooms_list");
            }, 2500);
        }
    };

    const confirmGuestLogin = async () => {
        setShowGuestModal(false);
        const guestData = await loginAsGuest();
        if (guestData) {
            sessionStorage.setItem("access_token", guestData.access_token);
            sessionStorage.setItem("username", guestData.username);
            sessionStorage.setItem("user_id", guestData.user_id);
            // Redirección blindada que no depende del ciclo de vida de React
            setTimeout(() => {
                navigate("/rooms_list");
            }, 2500);
        }

        
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await askForChange(forgotIdentifier);
    };

    const closeForgotModal = () => {
        setShowForgotModal(false);
        setForgotIdentifier("");
        resetForgotState();
    };

    return (
        <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            minHeight: "100vh", backgroundImage: THEME.backgroundImage,
            backgroundSize: "cover", backgroundPosition: "center",
            fontFamily: THEME.fontFamily, position: "relative"
        }}>
            
            <div style={{
                width: "100%", maxWidth: "400px", padding: "30px",
                backgroundColor: THEME.formBackground, borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)", color: THEME.textColor
            }}>
                <h2 style={{ textAlign: "center", marginBottom: "25px" }}>Happy Little Dinosaurs</h2>
                
                {/* --- NUEVO: PANTALLA DE ÉXITO CONDICIONAL --- */}
                {loginSuccess ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div className="dino-bounce" style={{ fontSize: "48px", marginBottom: "15px" }}>
                            🦕
                        </div>
                        <h3 style={{ color: THEME.successColor, marginBottom: "10px" }}>¡Acceso Concedido!</h3>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{loginSuccess}</p>
                        <p style={{ fontSize: "14px", color: "#666", marginTop: "20px" }}>Preparando tu mesa de juego...</p>
                        
                        {/* Pequeña barra de carga simulada para feedback visual */}
                        <div style={{ width: "100%", height: "4px", backgroundColor: "#eee", marginTop: "20px", borderRadius: "2px", overflow: "hidden" }}>
                            <div className="loading-bar-animated"></div>
                        </div>
                    </div>
                ) : (
                    // --- FORMULARIO NORMAL (Solo se muestra si no hay éxito) ---
                    <>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Usuario o Correo:</label>
                                <input type="text" name="identity" value={formData.identity} onChange={handleInputChange} style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Contraseña:</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
                                
                                <div style={{ textAlign: "right", marginTop: "8px" }}>
                                    <button type="button" onClick={() => setShowForgotModal(true)} style={{ background: "none", border: "none", color: THEME.guestColor, textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: "13px", fontFamily: "inherit" }}>
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoginLoading} style={{ width: "100%", padding: "12px", background: THEME.primaryColor, color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer", marginBottom: "10px" }}>
                                {isLoginLoading ? "Verificando..." : "Entrar"}
                            </button>

                            <button type="button" onClick={() => setShowGuestModal(true)} style={{ width: "100%", padding: "12px", background: THEME.guestColor, color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}>
                                Entrar como Invitado
                            </button>
                        </form>

                        {loginError && (
                            <div style={{ color: THEME.dangerColor, marginTop: "15px", textAlign: "center", fontWeight: "bold" }}>
                                {loginError}
                            </div>
                        )}

                        <div style={{ marginTop: "25px", textAlign: "center", fontSize: "14px" }}>
                            <span>¿Eres nuevo? </span>
                            <button onClick={() => navigate("/register")} style={{ background: "none", border: "none", color: THEME.guestColor, textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}>
                                crea tu cuenta aquí
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* --- MODALES --- */}
            {/* (El código de showGuestModal y showForgotModal permanece idéntico) */}
            {showGuestModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: THEME.overlayColor, display: "flex",
                    justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white", padding: "30px", borderRadius: "12px",
                        maxWidth: "400px", width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                        color: THEME.textColor, textAlign: "center"
                    }}>
                        <h3 style={{ marginTop: 0, color: THEME.dangerColor, fontSize: "22px" }}>⚠️ Aviso de Invitado</h3>
                        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>Estás a punto de entrar con una cuenta temporal de invitado. Ten en cuenta las siguientes limitaciones:</p>
                        <ul style={{ textAlign: "left", marginBottom: "25px", lineHeight: "1.6", backgroundColor: "#f9f9f9", padding: "15px 15px 15px 35px", borderRadius: "8px" }}>
                            <li>Tu progreso y estadísticas <b>no se guardarán</b>.</li>
                            <li>Si cierras la pestaña, <b>perderás tu sesión</b> para siempre.</li>
                            <li>No podrás agregar amigos ni chatear de forma global.</li>
                        </ul>
                        <p style={{ fontWeight: "bold", marginBottom: "20px" }}>¿Estás seguro de que deseas continuar?</p>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "15px" }}>
                            <button onClick={() => setShowGuestModal(false)} style={{ flex: 1, padding: "12px", backgroundColor: "#ddd", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Cancelar</button>
                            <button onClick={confirmGuestLogin} disabled={isLoginLoading} style={{ flex: 1, padding: "12px", backgroundColor: THEME.dangerColor, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                {isLoginLoading ? "Cargando..." : "Sí, continuar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showForgotModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: THEME.overlayColor, display: "flex",
                    justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white", padding: "30px", borderRadius: "12px",
                        maxWidth: "400px", width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                        color: THEME.textColor
                    }}>
                        <h3 style={{ marginTop: 0, color: THEME.primaryColor, fontSize: "22px", textAlign: "center" }}>Recuperar Contraseña</h3>
                        
                        {forgotSuccess ? (
                            <div style={{ textAlign: "center" }}>
                                <div style={{ color: "#2e7d32", backgroundColor: "#e8f5e9", padding: "15px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold" }}>
                                    ✅ {forgotSuccess}
                                </div>
                                <button onClick={closeForgotModal} style={{ width: "100%", padding: "12px", backgroundColor: THEME.primaryColor, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                    Entendido
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotSubmit}>
                                <p style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "20px", textAlign: "center" }}>
                                    Ingresa tu usuario o correo electrónico. Si la cuenta existe, te enviaremos un enlace para crear una nueva clave.
                                </p>

                                <input 
                                    type="text" 
                                    placeholder="Usuario o Correo..."
                                    value={forgotIdentifier} 
                                    onChange={(e) => setForgotIdentifier(e.target.value)} 
                                    style={{ width: "100%", padding: "12px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "15px" }} 
                                />

                                {forgotError && (
                                    <div style={{ color: THEME.dangerColor, marginBottom: "15px", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>
                                        {forgotError}
                                    </div>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between", gap: "15px" }}>
                                    <button type="button" onClick={closeForgotModal} style={{ flex: 1, padding: "12px", backgroundColor: "#ddd", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isForgotLoading} style={{ flex: 1, padding: "12px", backgroundColor: THEME.primaryColor, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                        {isForgotLoading ? "Enviando..." : "Enviar Enlace"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};