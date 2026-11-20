"""Console-based simulation implementation of the EmailService."""
from src.domain.interfaces.email_service import EmailService

class ConsoleEmailService(EmailService):
    """Simulates sending emails by printing the output to the server logs."""

    def __init__(self, base_client_url: str = "http://localhost:5173"):
        # Guardamos la URL de tu frontend de React (por defecto Vite usa el 5173)
        self.__base_client_url = base_client_url

    def send_password_change_email(self, to_email: str, reset_token: str) -> None:
        """Prints a highly visible mock email template into the terminal."""
        reset_link = f"{self.__base_client_url}/change_password?token={reset_token}"
        
        print("\n" + "="*60)
        print("📨 [SIMULACIÓN DE CORREO ELECTRÓNICO] 📨")
        print(f"Para: {to_email}")
        print("Asunto: Restablece tu contraseña - Happy Little Dinosaurs")
        print("-"*60)
        print("Hola,")
        print("Hemos recibido una solicitud para cambiar tu contraseña.")
        print("Haz clic en el siguiente enlace seguro para ingresar tu nueva clave:")
        print(f"\n👉 {reset_link} 👈\n")
        print("Este enlace expirará en 15 minutos y es de un solo uso.")
        print("="*60 + "\n")