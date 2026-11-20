"""Data Transfer Objects for User operations."""
from pydantic import BaseModel

class RegisterUserRequestDTO(BaseModel):
    """DTO for the incoming registration request."""
    username: str
    email: str
    password: str

class RegisterUserResponseDTO(BaseModel):
    """DTO for the outgoing successful registration response."""
    user_id: str
    username: str

class LoginRequestDTO(BaseModel):
    """Data Transfer Object for login requests."""
    identifier: str
    password: str

class LoginResponseDTO(BaseModel):
    """Data Transfer Object for successful login responses."""
    access_token: str
    expires_in: int
    username: str
    user_id: str

class AskForPasswordChangeRequestDTO(BaseModel):
    """Data Transfer Object to request a password change link."""
    identifier: str

class ApplyNewPasswordRequestDTO(BaseModel):
    """Data Transfer Object to apply the new password using a token."""
    token: str
    new_password: str