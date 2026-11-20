import datetime
from src.domain.entities.password_reset_token import PasswordResetToken

class InDocPasswordResetTokenMapper:
    """Transforms a raw dictionary document into a PasswordResetToken entity."""
    
    @staticmethod
    def to_domain(doc: dict) -> PasswordResetToken:
        """Converts a reset password token database record to domain entity."""
        # Restauramos la fecha desde el texto ISO
        expires_at = datetime.datetime.fromisoformat(doc["expires_at"])
        created_at = datetime.datetime.fromisoformat(doc["created_at"])

        return PasswordResetToken(
            token=doc["token"],
            user_id=doc["user_id"],
            expires_at=expires_at,
            created_at=created_at,
            is_used=doc["is_used"]
        )