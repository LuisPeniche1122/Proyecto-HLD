import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { useChangePassword } from "../hooks/use_change_password"; 
import imagenFondo from "../../../assets/login_background.jpg";

const THEME = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: `url(${imagenFondo})`,
    formBackground: "rgba(255, 255, 255, 0.95)",
    primaryColor: "#4CAF50",
    guestColor: "#2196F3",
    dangerColor: "#f44336",
    textColor: "#333",
    successColor: "#2e7d32" 
};

export const ChangePasswordPage: React.FC = () => {
    const navigate = useNavigate(); 
    const { changePassword, isLoading, error, successMessage } = useChangePassword();
    
    const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get("token");
        
        if (tokenFromUrl) {
            // Todo en orden, le damos acceso
            setToken(tokenFromUrl);
        } else {
            // --- PROTECCIÓN DE RUTA ---
            // Si alguien entra a la página a la fuerza sin un token, lo regresamos al login
            navigate("/login", { replace: true }); 
            // Nota: usamos replace: true para borrar este intento del historial del navegador
        }
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await changePassword(token, formData.newPassword, formData.confirmPassword);
    };

    // Si no hay token, React podría intentar renderizar la página una fracción de segundo
    // antes de que el useEffect lo expulse. Esto evita parpadeos visuales.
    if (!token) return null; 

    return (
        <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            minHeight: "100vh", backgroundImage: THEME.backgroundImage,
            backgroundSize: "cover", backgroundPosition: "center",
            fontFamily: THEME.fontFamily
        }}>
            <div style={{
                width: "100%", maxWidth: "400px", padding: "30px",
                backgroundColor: THEME.formBackground, borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)", color: THEME.textColor
            }}>
                <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Crea tu nueva contraseña</h2>
                <p style={{ textAlign: "center", fontSize: "14px", color: "#666", marginBottom: "25px" }}>
                    Ingresa una contraseña segura de al menos 8 caracteres.
                </p>
                
                {successMessage ? (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ color: THEME.successColor, fontWeight: "bold", fontSize: "16px", marginBottom: "20px", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "8px" }}>
                            ✅ {successMessage}
                        </div>
                        {/* El botón ahora es opcional porque el Hook redirigirá solo, pero es buena UX dejarlo por si el usuario es impaciente */}
                        <button onClick={() => navigate("/login")} style={{ width: "100%", padding: "12px", background: THEME.primaryColor, color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}>
                            Volver al Login Ahora
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nueva Contraseña:</label>
                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
                        </div>

                        <div style={{ marginBottom: "25px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Confirmar Contraseña:</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} style={{ width: "100%", padding: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            style={{ width: "100%", padding: "12px", background: THEME.primaryColor, color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? "Guardando..." : "Cambiar Contraseña"}
                        </button>
                        
                        <div style={{ marginTop: "20px", textAlign: "center" }}>
                            <button type="button" onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "#666", textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}>
                                Cancelar y volver al Login
                            </button>
                        </div>
                    </form>
                )}

                {error && (
                    <div style={{ color: THEME.dangerColor, marginTop: "20px", textAlign: "center", fontWeight: "bold", padding: "10px", backgroundColor: "#ffebee", borderRadius: "6px" }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};