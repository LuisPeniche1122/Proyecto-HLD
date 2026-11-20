"""Port translator for document/file persistence."""
from src.domain.entities.user import User

class InDocUserPort:
    """Translates a Domain User entity into a flat dictionary for text storage."""

    @staticmethod
    def to_doc(user: User) -> dict:
        """Converts a user domain entity to a serializable dictionary."""
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "password_hash": user.password_hash,
            "created_at": user.created_at.isoformat()
        }