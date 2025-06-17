from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.database.database import get_db
from src.models.models import User, Tenant
from src.schemas.schemas import UserCreate, UserUpdate, User as UserSchema, MessageResponse
from src.utils.dependencies import require_super_admin, require_tenant_admin, get_current_active_user
from src.utils.auth import get_password_hash
import uuid

users_router = APIRouter()

@users_router.post("/", response_model=UserSchema)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new user"""
    # Check permissions
    if current_user.rol == "SUPER_ADMIN":
        # Super admin can create any user
        pass
    elif current_user.rol == "TENANT_ADMIN":
        # Tenant admin can only create users in their tenant
        if user_data.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create user for different tenant"
            )
        # Tenant admin cannot create super admins
        if user_data.rol == "SUPER_ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create super admin user"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate tenant exists if provided
    if user_data.tenant_id:
        tenant = db.query(Tenant).filter(Tenant.id == user_data.tenant_id).first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenant not found"
            )
    
    # Create user
    user_dict = user_data.dict()
    password = user_dict.pop("password")
    user_dict["password_hash"] = get_password_hash(password)
    
    db_user = User(**user_dict)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@users_router.get("/", response_model=List[UserSchema])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    tenant_id: uuid.UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get users"""
    query = db.query(User)
    
    if current_user.rol == "SUPER_ADMIN":
        # Super admin can see all users
        if tenant_id:
            query = query.filter(User.tenant_id == tenant_id)
    elif current_user.rol == "TENANT_ADMIN":
        # Tenant admin can only see users from their tenant
        query = query.filter(User.tenant_id == current_user.tenant_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    users = query.offset(skip).limit(limit).all()
    return users

@users_router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check permissions
    if current_user.rol == "SUPER_ADMIN":
        pass  # Can see any user
    elif current_user.rol == "TENANT_ADMIN":
        if user.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot access user from different tenant"
            )
    elif current_user.id == user_id:
        pass  # Users can see their own info
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return user

@users_router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: uuid.UUID,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check permissions
    if current_user.rol == "SUPER_ADMIN":
        pass  # Can update any user
    elif current_user.rol == "TENANT_ADMIN":
        if user.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update user from different tenant"
            )
    elif current_user.id == user_id:
        # Users can update their own info (limited fields)
        allowed_fields = {"nombre", "apellido"}
        update_fields = set(user_update.dict(exclude_unset=True).keys())
        if not update_fields.issubset(allowed_fields):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only update name and surname"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@users_router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Delete user (Super Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Cannot delete self
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

