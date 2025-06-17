from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.database.database import get_db
from src.models.models import Tenant, User
from src.schemas.schemas import TenantCreate, TenantUpdate, Tenant as TenantSchema, MessageResponse
from src.utils.dependencies import require_super_admin
import uuid

tenants_router = APIRouter()

@tenants_router.post("/", response_model=TenantSchema)
async def create_tenant(
    tenant_data: TenantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Create a new tenant (Super Admin only)"""
    # Check if tenant name already exists
    existing_tenant = db.query(Tenant).filter(Tenant.nombre == tenant_data.nombre).first()
    if existing_tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant name already exists"
        )
    
    # Create new tenant
    db_tenant = Tenant(**tenant_data.dict())
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    
    return db_tenant

@tenants_router.get("/", response_model=List[TenantSchema])
async def get_tenants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get all tenants (Super Admin only)"""
    tenants = db.query(Tenant).offset(skip).limit(limit).all()
    return tenants

@tenants_router.get("/{tenant_id}", response_model=TenantSchema)
async def get_tenant(
    tenant_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get tenant by ID (Super Admin only)"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    return tenant

@tenants_router.put("/{tenant_id}", response_model=TenantSchema)
async def update_tenant(
    tenant_id: uuid.UUID,
    tenant_update: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Update tenant (Super Admin only)"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Update tenant fields
    update_data = tenant_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)
    
    db.commit()
    db.refresh(tenant)
    return tenant

@tenants_router.delete("/{tenant_id}", response_model=MessageResponse)
async def delete_tenant(
    tenant_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Delete tenant (Super Admin only)"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check if tenant has users or elections
    user_count = db.query(User).filter(User.tenant_id == tenant_id).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete tenant with existing users"
        )
    
    db.delete(tenant)
    db.commit()
    return {"message": "Tenant deleted successfully"}

