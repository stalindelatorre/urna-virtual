from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json
from src.database.database import get_db
from src.models.models import Simulacro, VotoSimulacro, Election, User
from src.schemas.schemas import SimulacroCreate, Simulacro as SimulacroSchema, MessageResponse
from src.utils.dependencies import require_tenant_admin, get_current_active_user
from src.utils.crypto import encrypt_vote
import uuid

simulacros_router = APIRouter()

@simulacros_router.post("/", response_model=SimulacroSchema)
async def create_simulacro(
    simulacro_data: SimulacroCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Create a new election simulation"""
    # Validate election exists
    election = db.query(Election).filter(Election.id == simulacro_data.eleccion_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create simulation for election from different tenant"
        )
    
    # Create simulation
    db_simulacro = Simulacro(**simulacro_data.dict())
    db.add(db_simulacro)
    db.commit()
    db.refresh(db_simulacro)
    
    return db_simulacro

@simulacros_router.get("/", response_model=List[SimulacroSchema])
async def get_simulacros(
    eleccion_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get simulations"""
    query = db.query(Simulacro).join(Election)
    
    if current_user.rol != "SUPER_ADMIN":
        # Filter by tenant
        query = query.filter(Election.tenant_id == current_user.tenant_id)
    
    if eleccion_id:
        query = query.filter(Simulacro.eleccion_id == eleccion_id)
    
    simulacros = query.offset(skip).limit(limit).all()
    return simulacros

@simulacros_router.get("/{simulacro_id}", response_model=SimulacroSchema)
async def get_simulacro(
    simulacro_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get simulation by ID"""
    simulacro = db.query(Simulacro).join(Election).filter(Simulacro.id == simulacro_id).first()
    if not simulacro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != simulacro.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access simulation from different tenant"
        )
    
    return simulacro

@simulacros_router.post("/{simulacro_id}/votar", response_model=MessageResponse)
async def cast_simulation_vote(
    simulacro_id: uuid.UUID,
    candidatos_seleccionados: List[uuid.UUID],
    votante_prueba: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cast a vote in a simulation"""
    # Validate simulation exists and is active
    simulacro = db.query(Simulacro).join(Election).filter(Simulacro.id == simulacro_id).first()
    if not simulacro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != simulacro.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot vote in simulation from different tenant"
        )
    
    if not simulacro.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Simulation is not active"
        )
    
    # Create simulation vote data
    vote_content = {
        "simulacro_id": str(simulacro_id),
        "candidatos": [str(c_id) for c_id in candidatos_seleccionados],
        "timestamp": datetime.utcnow().isoformat(),
        "votante_prueba": votante_prueba
    }
    
    # Encrypt vote
    voto_cifrado = encrypt_vote(json.dumps(vote_content))
    
    # Save simulation vote
    db_vote = VotoSimulacro(
        simulacro_id=simulacro_id,
        votante_prueba=votante_prueba,
        voto_cifrado=voto_cifrado
    )
    db.add(db_vote)
    db.commit()
    
    return {"message": "Simulation vote cast successfully"}

@simulacros_router.get("/{simulacro_id}/resultados")
async def get_simulation_results(
    simulacro_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get simulation results"""
    # Validate simulation exists
    simulacro = db.query(Simulacro).join(Election).filter(Simulacro.id == simulacro_id).first()
    if not simulacro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != simulacro.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access simulation from different tenant"
        )
    
    # Get all simulation votes
    votes = db.query(VotoSimulacro).filter(VotoSimulacro.simulacro_id == simulacro_id).all()
    
    # Count votes (simplified)
    results = {}
    total_votes = len(votes)
    
    for vote in votes:
        try:
            # Simplified vote counting
            vote_data = json.loads(vote.voto_cifrado.replace("ENCRYPTED:", ""))
            for candidate_id in vote_data.get("candidatos", []):
                if candidate_id not in results:
                    results[candidate_id] = 0
                results[candidate_id] += 1
        except:
            continue
    
    return {
        "simulacro_id": str(simulacro_id),
        "simulacro_name": simulacro.nombre,
        "total_votes": total_votes,
        "results": results
    }

@simulacros_router.put("/{simulacro_id}/toggle", response_model=MessageResponse)
async def toggle_simulation(
    simulacro_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Activate/deactivate simulation"""
    simulacro = db.query(Simulacro).join(Election).filter(Simulacro.id == simulacro_id).first()
    if not simulacro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != simulacro.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify simulation from different tenant"
        )
    
    simulacro.activo = not simulacro.activo
    db.commit()
    
    status_text = "activated" if simulacro.activo else "deactivated"
    return {"message": f"Simulation {status_text} successfully"}

@simulacros_router.delete("/{simulacro_id}", response_model=MessageResponse)
async def delete_simulation(
    simulacro_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Delete simulation"""
    simulacro = db.query(Simulacro).join(Election).filter(Simulacro.id == simulacro_id).first()
    if not simulacro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != simulacro.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete simulation from different tenant"
        )
    
    # Delete all simulation votes first
    db.query(VotoSimulacro).filter(VotoSimulacro.simulacro_id == simulacro_id).delete()
    
    # Delete simulation
    db.delete(simulacro)
    db.commit()
    
    return {"message": "Simulation deleted successfully"}

