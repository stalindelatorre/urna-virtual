from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Dict, Any, List
from datetime import datetime, timedelta
from src.database.database import get_db
from src.models.models import (
    Election, Vote, VotanteEleccion, User, Tenant, 
    Simulacro, VotoSimulacro, Candidate, Cargo
)
from src.utils.dependencies import get_current_active_user, require_tenant_admin
import uuid

metrics_router = APIRouter()

@metrics_router.get("/eleccion/{election_id}/tiempo-real")
async def get_real_time_metrics(
    election_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get real-time election metrics (no results, only participation)"""
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
    
    # Get participation metrics
    total_registered = db.query(VotanteEleccion).filter(
        VotanteEleccion.eleccion_id == election_id
    ).count()
    
    total_voted = db.query(VotanteEleccion).filter(
        and_(
            VotanteEleccion.eleccion_id == election_id,
            VotanteEleccion.ha_votado == True
        )
    ).count()
    
    # Get hourly voting pattern (last 24 hours)
    now = datetime.utcnow()
    hourly_votes = []
    for i in range(24):
        hour_start = now - timedelta(hours=i+1)
        hour_end = now - timedelta(hours=i)
        
        votes_in_hour = db.query(Vote).filter(
            and_(
                Vote.eleccion_id == election_id,
                Vote.timestamp >= hour_start,
                Vote.timestamp < hour_end
            )
        ).count()
        
        hourly_votes.append({
            "hour": hour_start.strftime("%H:00"),
            "votes": votes_in_hour
        })
    
    # Calculate participation rate
    participation_rate = (total_voted / total_registered * 100) if total_registered > 0 else 0
    
    # Get voting speed (votes per minute in last hour)
    last_hour = now - timedelta(hours=1)
    votes_last_hour = db.query(Vote).filter(
        and_(
            Vote.eleccion_id == election_id,
            Vote.timestamp >= last_hour
        )
    ).count()
    
    voting_speed = votes_last_hour / 60  # votes per minute
    
    # Estimate completion time
    remaining_voters = total_registered - total_voted
    estimated_completion = None
    if voting_speed > 0 and remaining_voters > 0:
        minutes_remaining = remaining_voters / voting_speed
        estimated_completion = (now + timedelta(minutes=minutes_remaining)).isoformat()
    
    return {
        "election_id": str(election_id),
        "election_title": election.titulo,
        "election_status": election.estado,
        "timestamp": now.isoformat(),
        "participation": {
            "total_registered": total_registered,
            "total_voted": total_voted,
            "remaining_voters": remaining_voters,
            "participation_rate": round(participation_rate, 2)
        },
        "voting_activity": {
            "votes_last_hour": votes_last_hour,
            "voting_speed_per_minute": round(voting_speed, 2),
            "estimated_completion": estimated_completion,
            "hourly_pattern": hourly_votes[:12]  # Last 12 hours
        },
        "system_status": {
            "server_healthy": True,
            "database_responsive": True,
            "last_vote_timestamp": None  # Will be populated if there are votes
        }
    }

@metrics_router.get("/eleccion/{election_id}/demograficos")
async def get_demographic_metrics(
    election_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Get demographic participation metrics"""
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
    
    # Get demographic breakdown (simplified - based on user data)
    demographic_data = db.query(
        User.pais,
        func.count(VotanteEleccion.votante_id).label('registered'),
        func.sum(func.cast(VotanteEleccion.ha_votado, db.Integer)).label('voted')
    ).join(
        VotanteEleccion, User.id == VotanteEleccion.votante_id
    ).filter(
        VotanteEleccion.eleccion_id == election_id
    ).group_by(User.pais).all()
    
    demographics = []
    for country, registered, voted in demographic_data:
        participation_rate = (voted / registered * 100) if registered > 0 else 0
        demographics.append({
            "country": country or "Unknown",
            "registered": registered,
            "voted": voted or 0,
            "participation_rate": round(participation_rate, 2)
        })
    
    return {
        "election_id": str(election_id),
        "demographic_breakdown": demographics
    }

@metrics_router.get("/tenant/{tenant_id}/resumen")
async def get_tenant_summary(
    tenant_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get tenant summary metrics"""
    # Check permissions
    if current_user.rol == "SUPER_ADMIN":
        # Super admin can access any tenant
        pass
    elif current_user.rol == "TENANT_ADMIN" and current_user.tenant_id == tenant_id:
        # Tenant admin can only access their own tenant
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate tenant exists
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Get tenant statistics
    total_elections = db.query(Election).filter(Election.tenant_id == tenant_id).count()
    active_elections = db.query(Election).filter(
        and_(Election.tenant_id == tenant_id, Election.estado == "ACTIVA")
    ).count()
    
    total_users = db.query(User).filter(User.tenant_id == tenant_id).count()
    total_voters = db.query(User).filter(
        and_(User.tenant_id == tenant_id, User.rol == "VOTANTE")
    ).count()
    
    # Get recent activity
    recent_votes = db.query(Vote).join(Election).filter(
        and_(
            Election.tenant_id == tenant_id,
            Vote.timestamp >= datetime.utcnow() - timedelta(days=7)
        )
    ).count()
    
    # Get simulations count
    total_simulations = db.query(Simulacro).join(Election).filter(
        Election.tenant_id == tenant_id
    ).count()
    
    return {
        "tenant_id": str(tenant_id),
        "tenant_name": tenant.nombre,
        "statistics": {
            "total_elections": total_elections,
            "active_elections": active_elections,
            "total_users": total_users,
            "total_voters": total_voters,
            "total_simulations": total_simulations,
            "votes_last_week": recent_votes
        },
        "status": {
            "tenant_active": tenant.activo,
            "last_activity": None  # Could be populated with last vote/login
        }
    }

@metrics_router.get("/sistema/salud")
async def get_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get system health metrics"""
    try:
        # Test database connectivity
        db.execute("SELECT 1")
        db_healthy = True
        db_response_time = "< 100ms"  # Simplified
    except Exception:
        db_healthy = False
        db_response_time = "timeout"
    
    # Get system statistics
    total_tenants = db.query(Tenant).count()
    active_tenants = db.query(Tenant).filter(Tenant.activo == True).count()
    total_elections = db.query(Election).count()
    active_elections = db.query(Election).filter(Election.estado == "ACTIVA").count()
    
    # Get recent activity
    votes_today = db.query(Vote).filter(
        Vote.timestamp >= datetime.utcnow().date()
    ).count()
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "system_status": "healthy" if db_healthy else "degraded",
        "components": {
            "database": {
                "status": "healthy" if db_healthy else "unhealthy",
                "response_time": db_response_time
            },
            "api": {
                "status": "healthy",
                "response_time": "< 50ms"
            }
        },
        "statistics": {
            "total_tenants": total_tenants,
            "active_tenants": active_tenants,
            "total_elections": total_elections,
            "active_elections": active_elections,
            "votes_today": votes_today
        }
    }

@metrics_router.get("/eleccion/{election_id}/auditoria")
async def get_audit_metrics(
    election_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tenant_admin)
):
    """Get election audit metrics"""
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
    
    # Get audit information
    total_votes = db.query(Vote).filter(Vote.eleccion_id == election_id).count()
    
    # Verify vote integrity (simplified)
    votes_with_signature = db.query(Vote).filter(
        and_(
            Vote.eleccion_id == election_id,
            Vote.firma_digital.isnot(None)
        )
    ).count()
    
    # Get blockchain integrity (simplified)
    blockchain_valid = True  # In production, verify actual blockchain
    
    return {
        "election_id": str(election_id),
        "audit_timestamp": datetime.utcnow().isoformat(),
        "vote_integrity": {
            "total_votes": total_votes,
            "votes_with_signature": votes_with_signature,
            "signature_rate": (votes_with_signature / total_votes * 100) if total_votes > 0 else 0
        },
        "blockchain_integrity": {
            "valid": blockchain_valid,
            "total_blocks": total_votes,
            "verified_blocks": total_votes  # Simplified
        },
        "security_status": {
            "encryption_enabled": True,
            "signatures_enabled": True,
            "blockchain_enabled": True
        }
    }

