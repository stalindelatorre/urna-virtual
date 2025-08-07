from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.database.database import get_db
from src.models.models import Cargo, Election
from src.schemas.schemas import CargoCreate, Cargo as CargoSchema, MessageResponse
from src.utils.dependencies import require_tenant_admin, get_current_active_user
import uuid

cargos_router = APIRouter()

@cargos_router.post("/", response_model=CargoSchema)
async def create_cargo(
    cargo_data: CargoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Create a new cargo"""
    # Validate election exists and belongs to user's tenant
    election = db.query(Election).filter(Election.id == cargo_data.eleccion_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create cargo for different tenant"
        )
    
    # Cannot create cargo for active or closed elections
    if election.estado in ["ACTIVA", "CERRADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create cargo for active or closed election"
        )
    
    # Check if cargo name already exists for this election
    existing_cargo = db.query(Cargo).filter(
        Cargo.eleccion_id == cargo_data.eleccion_id,
        Cargo.nombre == cargo_data.nombre
    ).first()
    if existing_cargo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cargo name already exists for this election"
        )
    
    # Create cargo
    db_cargo = Cargo(**cargo_data.dict())
    db.add(db_cargo)
    db.commit()
    db.refresh(db_cargo)
    
    return db_cargo

@cargos_router.get("/", response_model=List[CargoSchema])
async def get_cargos(
    eleccion_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get cargos"""
    query = db.query(Cargo).join(Election)
    
    if current_user.rol != "SUPER_ADMIN":
        # Filter by tenant
        query = query.filter(Election.tenant_id == current_user.tenant_id)
    
    if eleccion_id:
        query = query.filter(Cargo.eleccion_id == eleccion_id)
    
    cargos = query.offset(skip).limit(limit).all()
    return cargos

@cargos_router.get("/{cargo_id}", response_model=CargoSchema)
async def get_cargo(
    cargo_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get cargo by ID"""
    cargo = db.query(Cargo).join(Election).filter(Cargo.id == cargo_id).first()
    if not cargo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cargo not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access cargo from different tenant"
        )
    
    return cargo

@cargos_router.put("/{cargo_id}", response_model=CargoSchema)
async def update_cargo(
    cargo_id: uuid.UUID,
    cargo_update: dict,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Update cargo"""
    cargo = db.query(Cargo).join(Election).filter(Cargo.id == cargo_id).first()
    if not cargo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cargo not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update cargo from different tenant"
        )
    
    # Cannot update if election is active or closed
    if cargo.eleccion.estado in ["ACTIVA", "CERRADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update cargo in active or closed election"
        )
    
    # Update cargo fields
    allowed_fields = ["nombre", "descripcion", "max_candidatos_a_elegir"]
    for field, value in cargo_update.items():
        if field in allowed_fields:
            setattr(cargo, field, value)
    
    db.commit()
    db.refresh(cargo)
    return cargo

@cargos_router.delete("/{cargo_id}", response_model=MessageResponse)
async def delete_cargo(
    cargo_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Delete cargo"""
    cargo = db.query(Cargo).join(Election).filter(Cargo.id == cargo_id).first()
    if not cargo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cargo not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete cargo from different tenant"
        )
    
    # Cannot delete if election is active or closed
    if cargo.eleccion.estado in ["ACTIVA", "CERRADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete cargo in active or closed election"
        )
    
    # Check if cargo has candidates
    from src.models.models import Candidate
    candidates_count = db.query(Candidate).filter(Candidate.cargo_id == cargo_id).count()
    if candidates_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete cargo with existing candidates"
        )
    
    db.delete(cargo)
    db.commit()
    return {"message": "Cargo deleted successfully"}

