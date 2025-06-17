from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import json
import hashlib
import uuid as uuid_lib
from src.database.database import get_db
from src.models.models import Vote, Election, User, VotanteEleccion, Candidate, Cargo
from src.schemas.schemas import VoteCreate, Vote as VoteSchema, MessageResponse
from src.utils.dependencies import get_current_active_user
from src.utils.crypto import encrypt_vote, create_vote_signature

votes_router = APIRouter()

@votes_router.post("/", response_model=MessageResponse)
async def cast_vote(
    vote_data: VoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cast a vote in an election"""
    # Validate election exists and is active
    election = db.query(Election).filter(Election.id == vote_data.eleccion_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot vote in election from different tenant"
        )
    
    # Check if election is active
    if election.estado != "ACTIVA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Election is not active"
        )
    
    # Check if user is registered to vote in this election
    votante_eleccion = db.query(VotanteEleccion).filter(
        VotanteEleccion.eleccion_id == vote_data.eleccion_id,
        VotanteEleccion.votante_id == current_user.id
    ).first()
    
    if not votante_eleccion:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not registered to vote in this election"
        )
    
    # Check if user has already voted
    if votante_eleccion.ha_votado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has already voted in this election"
        )
    
    # Validate candidates exist and belong to this election
    candidates = db.query(Candidate).join(Cargo).filter(
        Candidate.id.in_(vote_data.candidatos_seleccionados),
        Cargo.eleccion_id == vote_data.eleccion_id
    ).all()
    
    if len(candidates) != len(vote_data.candidatos_seleccionados):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more candidates not found or don't belong to this election"
        )
    
    # Validate voting rules (max candidates per cargo)
    cargo_votes = {}
    for candidate in candidates:
        cargo_id = candidate.cargo_id
        if cargo_id not in cargo_votes:
            cargo_votes[cargo_id] = 0
        cargo_votes[cargo_id] += 1
    
    # Check limits per cargo
    for cargo_id, vote_count in cargo_votes.items():
        cargo = db.query(Cargo).filter(Cargo.id == cargo_id).first()
        if vote_count > cargo.max_candidatos_a_elegir:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Too many candidates selected for cargo: {cargo.nombre}"
            )
    
    # Create vote data structure
    vote_content = {
        "eleccion_id": str(vote_data.eleccion_id),
        "candidatos": [str(c_id) for c_id in vote_data.candidatos_seleccionados],
        "timestamp": datetime.utcnow().isoformat(),
        "votante_hash": hashlib.sha256(str(current_user.id).encode()).hexdigest()[:16]
    }
    
    # Encrypt vote
    voto_cifrado = encrypt_vote(json.dumps(vote_content))
    
    # Create digital signature
    firma_digital = create_vote_signature(voto_cifrado, str(current_user.id))
    
    # Create blockchain hash (simplified)
    previous_vote = db.query(Vote).filter(Vote.eleccion_id == vote_data.eleccion_id).order_by(Vote.timestamp.desc()).first()
    previous_hash = previous_vote.hash_bloque if previous_vote else "genesis"
    current_hash = hashlib.sha256(f"{previous_hash}{voto_cifrado}{firma_digital}".encode()).hexdigest()
    
    # Save vote
    db_vote = Vote(
        eleccion_id=vote_data.eleccion_id,
        votante_id=current_user.id,
        voto_cifrado=voto_cifrado,
        firma_digital=firma_digital,
        hash_bloque=current_hash
    )
    db.add(db_vote)
    
    # Mark user as voted
    votante_eleccion.ha_votado = True
    
    db.commit()
    
    return {"message": "Vote cast successfully"}

@votes_router.get("/eleccion/{election_id}/resultados")
async def get_election_results(
    election_id: uuid_lib.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get election results (only for closed elections)"""
    # Validate election exists
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
    
    # Only allow results for closed elections
    if election.estado != "CERRADA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Results only available for closed elections"
        )
    
    # Get all votes for this election
    votes = db.query(Vote).filter(Vote.eleccion_id == election_id).all()
    
    # Decrypt and count votes (simplified - in production use proper decryption)
    results = {}
    total_votes = len(votes)
    
    # Get all candidates for this election
    candidates = db.query(Candidate).join(Cargo).filter(Cargo.eleccion_id == election_id).all()
    
    # Initialize results
    for candidate in candidates:
        results[str(candidate.id)] = {
            "candidate_name": f"{candidate.nombre} {candidate.apellido}",
            "cargo": candidate.cargo.nombre,
            "votes": 0,
            "percentage": 0.0
        }
    
    # Count votes (simplified counting - in production decrypt properly)
    for vote in votes:
        try:
            # This is a simplified version - in production, properly decrypt the vote
            # For now, we'll simulate vote counting
            vote_data = json.loads(vote.voto_cifrado.replace("ENCRYPTED:", ""))
            for candidate_id in vote_data.get("candidatos", []):
                if candidate_id in results:
                    results[candidate_id]["votes"] += 1
        except:
            continue
    
    # Calculate percentages
    for candidate_id in results:
        if total_votes > 0:
            results[candidate_id]["percentage"] = (results[candidate_id]["votes"] / total_votes) * 100
    
    return {
        "election_id": str(election_id),
        "election_title": election.titulo,
        "total_votes": total_votes,
        "results": results
    }

@votes_router.get("/eleccion/{election_id}/participacion")
async def get_election_participation(
    election_id: uuid_lib.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get election participation statistics"""
    # Validate election exists
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
    
    # Get participation statistics
    total_registered = db.query(VotanteEleccion).filter(VotanteEleccion.eleccion_id == election_id).count()
    total_voted = db.query(VotanteEleccion).filter(
        VotanteEleccion.eleccion_id == election_id,
        VotanteEleccion.ha_votado == True
    ).count()
    
    participation_rate = (total_voted / total_registered * 100) if total_registered > 0 else 0
    
    return {
        "election_id": str(election_id),
        "total_registered": total_registered,
        "total_voted": total_voted,
        "remaining_voters": total_registered - total_voted,
        "participation_rate": round(participation_rate, 2)
    }

@votes_router.post("/eleccion/{election_id}/registrar-votantes", response_model=MessageResponse)
async def register_voters(
    election_id: uuid_lib.UUID,
    voter_ids: List[uuid_lib.UUID],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Register voters for an election"""
    # Validate election exists
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found"
        )
    
    # Check tenant access and permissions
    if current_user.rol not in ["SUPER_ADMIN", "TENANT_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != election.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot register voters for election from different tenant"
        )
    
    # Cannot register voters for active or closed elections
    if election.estado in ["ACTIVA", "CERRADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot register voters for active or closed election"
        )
    
    # Validate all voters exist and belong to the same tenant
    voters = db.query(User).filter(
        User.id.in_(voter_ids),
        User.tenant_id == election.tenant_id,
        User.rol == "VOTANTE"
    ).all()
    
    if len(voters) != len(voter_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more voters not found or don't belong to this tenant"
        )
    
    # Register voters
    registered_count = 0
    for voter_id in voter_ids:
        # Check if already registered
        existing = db.query(VotanteEleccion).filter(
            VotanteEleccion.eleccion_id == election_id,
            VotanteEleccion.votante_id == voter_id
        ).first()
        
        if not existing:
            votante_eleccion = VotanteEleccion(
                eleccion_id=election_id,
                votante_id=voter_id,
                ha_votado=False
            )
            db.add(votante_eleccion)
            registered_count += 1
    
    db.commit()
    
    return {"message": f"Successfully registered {registered_count} voters"}

@votes_router.get("/mi-voto/{election_id}")
async def get_my_vote_status(
    election_id: uuid_lib.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's vote status for an election"""
    # Validate election exists
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
    
    # Get voter registration status
    votante_eleccion = db.query(VotanteEleccion).filter(
        VotanteEleccion.eleccion_id == election_id,
        VotanteEleccion.votante_id == current_user.id
    ).first()
    
    if not votante_eleccion:
        return {
            "registered": False,
            "has_voted": False,
            "can_vote": False,
            "election_status": election.estado
        }
    
    can_vote = (
        election.estado == "ACTIVA" and 
        not votante_eleccion.ha_votado and
        current_user.rol == "VOTANTE"
    )
    
    return {
        "registered": True,
        "has_voted": votante_eleccion.ha_votado,
        "can_vote": can_vote,
        "election_status": election.estado,
        "vote_timestamp": None  # For privacy, don't return actual vote timestamp
    }

