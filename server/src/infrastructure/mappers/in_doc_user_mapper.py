"""Data Mapper for document/file persistence."""
from datetime import datetime
from src.domain.entities.user import User

class InDocUserMapper:
    """Translates a flat dictionary from a text file into a Domain User entity."""

    @staticmethod
    def to_domain(record: dict) -> User:
        """Converts a user database record to domain entity."""

        created_at = datetime.fromisoformat(record["created_at"])
        return User(
            id=record["id"],
            username=record["username"],
            email=record["email"],
            password_hash=record["password_hash"],
            created_at=created_at
        )