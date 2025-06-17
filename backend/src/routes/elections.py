from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import pytz
from src.database.database import get_db
from src.models.models import Election, User, Tenant
from src.schemas.schemas import ElectionCreate, ElectionUpdate, Election as ElectionSchema, MessageResponse
from src.utils.dependencies import require_tenant_admin, get_current_active_user, require_same_tenant
import uuid

elections_router = APIRouter()

@elections_router.post("/", response_model=ElectionSchema)
async def create_election(
    election_data: ElectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Create a new election"""
    # Validate tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election_data.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create election for different tenant"
        )
    
    # Validate tenant exists
    tenant = db.query(Tenant).filter(Tenant.id == election_data.tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant not found"
        )
    
    # Validate dates
    if election_data.fecha_inicio >= election_data.fecha_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )
    
    # Convert dates to tenant timezone
    tenant_tz = pytz.timezone(tenant.zona_horaria)
    now_tenant = datetime.now(tenant_tz)
    
    if election_data.fecha_inicio <= now_tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be in the future"
        )
    
    # Create election
    election_dict = election_data.dict()
    election_dict["estado"] = "PENDIENTE"
    
    db_election = Election(**election_dict)
    db.add(db_election)
    db.commit()
    db.refresh(db_election)
    
    return db_election

@elections_router.get("/", response_model=List[ElectionSchema])
async def get_elections(
    skip: int = 0,
    limit: int = 100,
    tenant_id: uuid.UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get elections"""
    query = db.query(Election)
    
    if current_user.rol == "SUPER_ADMIN":
        # Super admin can see all elections
        if tenant_id:
            query = query.filter(Election.tenant_id == tenant_id)
    else:
        # Other users can only see elections from their tenant
        query = query.filter(Election.tenant_id == current_user.tenant_id)
    
    elections = query.offset(skip).limit(limit).all()
    return elections

@elections_router.get("/{election_id}", response_model=ElectionSchema)
async def get_election(
    election_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get election by ID"""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access election from different tenant"
        )
    
    return election

@elections_router.put("/{election_id}", response_model=ElectionSchema)
async def update_election(
    election_id: uuid.UUID,
    election_update: ElectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Update election (only if not started)"""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update election from different tenant"
        )
    
    # Cannot update active or closed elections
    if election.estado in ["ACTIVA", "CERRADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update active or closed election"
        )
    
    # Update election fields
    update_data = election_update.dict(exclude_unset=True)
    
    # Validate dates if provided
    if "fecha_inicio" in update_data or "fecha_fin" in update_data:
        fecha_inicio = update_data.get("fecha_inicio", election.fecha_inicio)
        fecha_fin = update_data.get("fecha_fin", election.fecha_fin)
        
        if fecha_inicio >= fecha_fin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date"
            )
    
    for field, value in update_data.items():
        setattr(election, field, value)
    
    db.commit()
    db.refresh(election)
    return election

@elections_router.delete("/{election_id}", response_model=MessageResponse)
async def delete_election(
    election_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Delete election (only if not started)"""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete election from different tenant"
        )
    
    # Cannot delete active or closed elections
    if election.estado in ["ACTIVA", "CERRADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete active or closed election"
        )
    
    db.delete(election)
    db.commit()
    return {"message": "Election deleted successfully"}

@elections_router.post("/{election_id}/activate", response_model=MessageResponse)
async def activate_election(
    election_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Manually activate election"""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot activate election from different tenant"
        )
    
    if election.estado != "PENDIENTE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Election is not in pending state"
        )
    
    election.estado = "ACTIVA"
    db.commit()
    return {"message": "Election activated successfully"}

@elections_router.post("/{election_id}/close", response_model=MessageResponse)
async def close_election(
    election_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Manually close election"""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot close election from different tenant"
        )
    
    if election.estado != "ACTIVA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Election is not active"
        )
    
    election.estado = "CERRADA"
    db.commit()
    return {"message": "Election closed successfully"}

