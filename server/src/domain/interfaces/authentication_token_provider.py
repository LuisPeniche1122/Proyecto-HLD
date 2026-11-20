"""Interface for authentication token generation."""
from typing import Any, Dict, Optional, Protocol

class AuthenticationTokenProvider(Protocol):
    """Contract for generating authentication tokens (e.g., JWT)."""

    def generate_token(self, user_id: str, username: str, is_guest: bool = False) -> str:
        """Generates a secure authentication token for the given user."""

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verifies the token and returns its payload if valid.
        Returns None if the token is invalid, expired, or malformed.
        """

    @property
    def expiration_seconds(self) -> int:
        """Returns the configured expiration time in seconds."""