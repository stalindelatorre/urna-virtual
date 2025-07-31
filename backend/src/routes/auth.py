from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.database import get_db
from src.models.models import User
from src.schemas.schemas import LoginRequest, Token, UserCreate, User as UserSchema
from src.utils.auth import verify_password, get_password_hash, create_access_token, create_refresh_token, verify_token
from src.utils.dependencies import get_current_user
from datetime import timedelta

auth_router = APIRouter()

@auth_router.post("/login")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT tokens"""
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id), "tenant_id": str(user.tenant_id) if user.tenant_id else None, "rol": user.rol},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "tenant_id": str(user.tenant_id) if user.tenant_id else None, "rol": user.rol}
    )
    print(user.id, user.email, user.nombre, user.apellido, user.rol, user.tenant_id, user.activo)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        #"token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "rol": user.rol,
            "tenant_id": str(user.tenant_id) if user.tenant_id else None,
            "activo": user.activo
        }
    }

@auth_router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    payload = verify_token(refresh_token, "refresh")
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id), "tenant_id": str(user.tenant_id) if user.tenant_id else None, "rol": user.rol},
        expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id), "tenant_id": str(user.tenant_id) if user.tenant_id else None, "rol": user.rol}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@auth_router.get("/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@auth_router.post("/logout")
async def logout():
    """Logout user (client should discard tokens)"""
    return {"message": "Successfully logged out"}

