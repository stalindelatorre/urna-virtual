from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from src.database.database import get_db
from src.models.models import User
from src.utils.auth import verify_token
from src.schemas.schemas import TokenData
import uuid

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = verify_token(token, "access")
    
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.activo:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_super_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Require super admin role"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def require_tenant_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Require tenant admin role"""
    if current_user.rol not in ["SUPER_ADMIN", "TENANT_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def require_same_tenant(tenant_id: uuid.UUID, current_user: User = Depends(get_current_active_user)) -> User:
    """Require user to belong to the same tenant"""
    if current_user.rol == "SUPER_ADMIN":
        return current_user
    
    if current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this tenant"
        )
    return current_user


def require_super_admin(current_user: User = Depends(get_current_active_user)):
    """Dependency to require super admin role"""
    if current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user

def require_tenant_admin(current_user: User = Depends(get_current_active_user)):
    """Dependency to require tenant admin or super admin role"""
    if current_user.rol not in ["SUPER_ADMIN", "TENANT_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

