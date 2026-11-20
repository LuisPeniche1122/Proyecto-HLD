"""Unit tests for the GuestUser entity."""
from src.domain.entities.guest_user import GuestUser

def test_guest_user_create_random_success():
    """Test that the factory generates a valid guest user with a UUID and formatted username."""
    # Actuar
    guest = GuestUser.create_random()

    # Comprobar
    assert guest.id is not None
    assert isinstance(guest.id, str)
    assert len(guest.id) > 10 # Es un UUID largo
    
    assert guest.username is not None
    assert "_" in guest.username # Validamos que contenga el guion bajo de tu diseño
    assert guest.is_guest is True # Validamos que la bandera por defecto funcione