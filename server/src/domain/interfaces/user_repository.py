"""Interface for User data persistence."""
from typing import Optional, Protocol
from src.domain.entities.user import User

class UserRepository(Protocol):
    """Contract that any database adapter must fulfill."""

    def find_by_username(self, username: str) -> Optional[User]:
        """Search for a user by their username."""

    def find_by_email(self, email: str) -> Optional[User]:
        """Search for a user by their email."""

    def find_by_id(self, user_id: str) -> Optional[User]:
        """Search for a user by their unique ID."""

    def update(self, user: User) -> None:
        """Update an existing user's information."""

    def save(self, user: User) -> None:
        """Persist a new user."""