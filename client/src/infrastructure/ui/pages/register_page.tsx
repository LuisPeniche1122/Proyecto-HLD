import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- 1. Importamos el hook nativo
import { useRegisterUser } from "../hooks/use_register_user";

// ==========================================
// CONFIGURACIÓN DE DISEÑO
// ==========================================
const THEME = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundImage: "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809')", 
    formBackground: "rgba(255, 255, 255, 0.95)",
    primaryColor: "#4CAF50",
    linkColor: "#2196F3",
    textColor: "#333"
};

// 2. Quitamos la interfaz RegisterPageProps y el parámetro onNavigate
export const RegisterPage: React.FC = () => {
    const navigate = useNavigate(); // <-- 3. Instanciamos el enrutador
    
    const { registerUser, isLoading, error, isSuccess } = useRegisterUser();
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await registerUser(formData);
    };

    // --- PANTALLA DE ÉXITO ---
    if (isSuccess) {
        return (
            <div style={{
                display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh",
                backgroundImage: THEME.backgroundImage, backgroundSize: "cover", fontFamily: THEME.fontFamily
            }}>
                <div style={{ backgroundColor: THEME.formBackground, padding: "40px", borderRadius: "12px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                    <h2 style={{ color: THEME.primaryColor }}>¡Cuenta creada con éxito!</h2>
                    <p>Tu dinosaurio está listo para la acción.</p>
                    {/* 4. Usamos navigate con ruta absoluta */}
                    <button onClick={() => navigate("/login")} style={{ padding: "10px 20px", background: THEME.primaryColor, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "15px" }}>
                        Ir al Inicio de Sesión
                    </button>
                </div>
            </div>
        );
    }

    // --- PANTALLA DE FORMULARIO ---
    return (
        <div style={{
            display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh",
            backgroundImage: THEME.backgroundImage, backgroundSize: "cover", backgroundPosition: "center", fontFamily: THEME.fontFamily
        }}>
            <div style={{
                width: "100%", maxWidth: "400px", padding: "30px", backgroundColor: THEME.formBackground,
                borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", color: THEME.textColor
            }}>
                <h2 style={{ textAlign: "center", marginBottom: "25px" }}>Crear Cuenta</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Usuario:</label>
                        <input type="text" name="username" value={formData.username} onChange={handleInputChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Correo Electrónico:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Contraseña:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Confirmar Contraseña:</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>

                    <button type="submit" disabled={isLoading} style={{ width: "100%", padding: "12px", background: THEME.primaryColor, color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}>
                        {isLoading ? "Procesando..." : "Registrarse"}
                    </button>
                </form>

                {error && (
                    <div style={{ color: "red", marginTop: "15px", textAlign: "center", fontWeight: "bold" }}>
                        {error}
                    </div>
                )}

                <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
                    <span>¿Ya tienes cuenta? </span>
                    {/* 5. Usamos navigate aquí también */}
                    <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: THEME.linkColor, textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}>
                        Inicia sesión aquí
                    </button>
                </div>
            </div>
        </div>
    );
};