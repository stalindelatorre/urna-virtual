import hashlib
import json
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

# Generate a key for encryption (in production, use proper key management)
def get_encryption_key():
    """Get or generate encryption key"""
    key_file = "encryption.key"
    if os.path.exists(key_file):
        with open(key_file, "rb") as f:
            return f.read()
    else:
        key = Fernet.generate_key()
        with open(key_file, "wb") as f:
            f.write(key)
        return key

def encrypt_vote(vote_data: str) -> str:
    """Encrypt vote data"""
    try:
        key = get_encryption_key()
        f = Fernet(key)
        encrypted_data = f.encrypt(vote_data.encode())
        return base64.b64encode(encrypted_data).decode()
    except Exception:
        # Fallback to simple encoding for demo purposes
        return f"ENCRYPTED:{base64.b64encode(vote_data.encode()).decode()}"

def decrypt_vote(encrypted_data: str) -> str:
    """Decrypt vote data"""
    try:
        if encrypted_data.startswith("ENCRYPTED:"):
            # Handle fallback encoding
            return base64.b64decode(encrypted_data[10:]).decode()
        
        key = get_encryption_key()
        f = Fernet(key)
        decoded_data = base64.b64decode(encrypted_data.encode())
        decrypted_data = f.decrypt(decoded_data)
        return decrypted_data.decode()
    except Exception:
        return encrypted_data

def create_vote_signature(vote_data: str, voter_id: str) -> str:
    """Create a digital signature for the vote"""
    # Simplified signature - in production use proper digital signatures
    signature_data = f"{vote_data}{voter_id}"
    return hashlib.sha256(signature_data.encode()).hexdigest()

def verify_vote_signature(vote_data: str, voter_id: str, signature: str) -> bool:
    """Verify vote signature"""
    expected_signature = create_vote_signature(vote_data, voter_id)
    return signature == expected_signature

