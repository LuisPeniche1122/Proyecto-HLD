from src.domain.entities.password_reset_token import PasswordResetToken

class InDocPasswordResetTokenPort:
    """Transforms a PasswordResetToken entity into a raw dictionary document."""
    
    @staticmethod
    def to_doc(password_reset_token: PasswordResetToken) -> dict:
        """Converts a password reset token domain entity to a serializable dictionary."""

        return {
            "token": password_reset_token.token,
            "user_id": password_reset_token.user_id,
            "expires_at": password_reset_token.expires_at.isoformat(), # Convertimos a texto
            "created_at": password_reset_token.created_at.isoformat(), # Convertimos a texto
            "is_used": password_reset_token.is_used
        }