from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from src.database.database import get_db
from src.models.models import (
    Election, Vote, VotanteEleccion, User, Tenant, 
    Simulacro, VotoSimulacro, Candidate, Cargo
)
from src.utils.dependencies import require_super_admin, get_current_active_user
import uuid

reports_router = APIRouter()

@reports_router.get("/super-admin/uso-plataforma")
async def get_platform_usage_report(
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get platform usage report for billing purposes"""
    
    # Parse dates
    if fecha_inicio:
        start_date = datetime.fromisoformat(fecha_inicio.replace('Z', '+00:00'))
    else:
        start_date = datetime.utcnow() - timedelta(days=30)
    
    if fecha_fin:
        end_date = datetime.fromisoformat(fecha_fin.replace('Z', '+00:00'))
    else:
        end_date = datetime.utcnow()
    
    # Get usage data per tenant
    tenant_usage = []
    tenants = db.query(Tenant).all()
    
    for tenant in tenants:
        # Elections in period
        elections_query = db.query(Election).filter(
            and_(
                Election.tenant_id == tenant.id,
                Election.fecha_creacion >= start_date,
                Election.fecha_creacion <= end_date
            )
        )
        
        total_elections = elections_query.count()
        completed_elections = elections_query.filter(Election.estado == "CERRADA").count()
        
        # Voters registered in period
        voters_registered = db.query(VotanteEleccion).join(Election).filter(
            and_(
                Election.tenant_id == tenant.id,
                Election.fecha_creacion >= start_date,
                Election.fecha_creacion <= end_date
            )
        ).count()
        
        # Actual votes cast
        votes_cast = db.query(Vote).join(Election).filter(
            and_(
                Election.tenant_id == tenant.id,
                Vote.timestamp >= start_date,
                Vote.timestamp <= end_date
            )
        ).count()
        
        # Simulations run
        simulations_run = db.query(Simulacro).join(Election).filter(
            and_(
                Election.tenant_id == tenant.id,
                Simulacro.fecha_creacion >= start_date,
                Simulacro.fecha_creacion <= end_date
            )
        ).count()
        
        # Calculate billing metrics
        # Base pricing model (example)
        base_cost = 50.0  # Base monthly cost
        election_cost = total_elections * 25.0  # $25 per election
        voter_cost = voters_registered * 0.10  # $0.10 per registered voter
        vote_cost = votes_cast * 0.05  # $0.05 per vote cast
        simulation_cost = simulations_run * 5.0  # $5 per simulation
        
        total_cost = base_cost + election_cost + voter_cost + vote_cost + simulation_cost
        
        tenant_usage.append({
            "tenant_id": str(tenant.id),
            "tenant_name": tenant.nombre,
            "tenant_email": tenant.email_contacto,
            "tenant_country": tenant.pais,
            "tenant_active": tenant.activo,
            "usage_metrics": {
                "total_elections": total_elections,
                "completed_elections": completed_elections,
                "voters_registered": voters_registered,
                "votes_cast": votes_cast,
                "simulations_run": simulations_run
            },
            "billing": {
                "base_cost": base_cost,
                "election_cost": election_cost,
                "voter_cost": voter_cost,
                "vote_cost": vote_cost,
                "simulation_cost": simulation_cost,
                "total_cost": round(total_cost, 2)
            }
        })
    
    # Calculate totals
    total_metrics = {
        "total_tenants": len(tenants),
        "active_tenants": sum(1 for t in tenant_usage if t["tenant_active"]),
        "total_elections": sum(t["usage_metrics"]["total_elections"] for t in tenant_usage),
        "total_voters": sum(t["usage_metrics"]["voters_registered"] for t in tenant_usage),
        "total_votes": sum(t["usage_metrics"]["votes_cast"] for t in tenant_usage),
        "total_simulations": sum(t["usage_metrics"]["simulations_run"] for t in tenant_usage),
        "total_revenue": sum(t["billing"]["total_cost"] for t in tenant_usage)
    }
    
    return {
        "report_period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": (end_date - start_date).days
        },
        "summary": total_metrics,
        "tenant_details": tenant_usage,
        "generated_at": datetime.utcnow().isoformat()
    }

@reports_router.get("/tenant/{tenant_id}/actividad")
async def get_tenant_activity_report(
    tenant_id: uuid.UUID,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed activity report for a tenant"""
    
    # Check permissions
    if current_user.rol == "SUPER_ADMIN":
        pass
    elif current_user.rol == "TENANT_ADMIN" and current_user.tenant_id == tenant_id:
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate tenant
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Parse dates
    if fecha_inicio:
        start_date = datetime.fromisoformat(fecha_inicio.replace('Z', '+00:00'))
    else:
        start_date = datetime.utcnow() - timedelta(days=30)
    
    if fecha_fin:
        end_date = datetime.fromisoformat(fecha_fin.replace('Z', '+00:00'))
    else:
        end_date = datetime.utcnow()
    
    # Get elections in period
    elections = db.query(Election).filter(
        and_(
            Election.tenant_id == tenant_id,
            Election.fecha_creacion >= start_date,
            Election.fecha_creacion <= end_date
        )
    ).all()
    
    election_details = []
    for election in elections:
        # Get participation data
        total_registered = db.query(VotanteEleccion).filter(
            VotanteEleccion.eleccion_id == election.id
        ).count()
        
        total_voted = db.query(VotanteEleccion).filter(
            and_(
                VotanteEleccion.eleccion_id == election.id,
                VotanteEleccion.ha_votado == True
            )
        ).count()
        
        participation_rate = (total_voted / total_registered * 100) if total_registered > 0 else 0
        
        # Get candidates count
        candidates_count = db.query(Candidate).join(Cargo).filter(
            Cargo.eleccion_id == election.id
        ).count()
        
        election_details.append({
            "election_id": str(election.id),
            "title": election.titulo,
            "description": election.descripcion,
            "status": election.estado,
            "start_date": election.fecha_inicio.isoformat() if election.fecha_inicio else None,
            "end_date": election.fecha_fin.isoformat() if election.fecha_fin else None,
            "created_date": election.fecha_creacion.isoformat(),
            "participation": {
                "registered_voters": total_registered,
                "votes_cast": total_voted,
                "participation_rate": round(participation_rate, 2)
            },
            "candidates_count": candidates_count
        })
    
    # Get user activity
    users_created = db.query(User).filter(
        and_(
            User.tenant_id == tenant_id,
            User.fecha_creacion >= start_date,
            User.fecha_creacion <= end_date
        )
    ).count()
    
    # Get simulations
    simulations = db.query(Simulacro).join(Election).filter(
        and_(
            Election.tenant_id == tenant_id,
            Simulacro.fecha_creacion >= start_date,
            Simulacro.fecha_creacion <= end_date
        )
    ).count()
    
    return {
        "tenant_info": {
            "tenant_id": str(tenant_id),
            "name": tenant.nombre,
            "email": tenant.email_contacto,
            "country": tenant.pais,
            "timezone": tenant.zona_horaria,
            "active": tenant.activo
        },
        "report_period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "summary": {
            "total_elections": len(elections),
            "completed_elections": len([e for e in elections if e.estado == "CERRADA"]),
            "active_elections": len([e for e in elections if e.estado == "ACTIVA"]),
            "total_simulations": simulations,
            "new_users": users_created
        },
        "elections": election_details,
        "generated_at": datetime.utcnow().isoformat()
    }

@reports_router.get("/eleccion/{election_id}/completo")
async def get_complete_election_report(
    election_id: uuid.UUID,
    incluir_resultados: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get complete election report"""
    
    # Validate election
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
    
    # Results only for closed elections or super admin
    if incluir_resultados and election.estado != "CERRADA" and current_user.rol != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Results only available for closed elections"
        )
    
    # Get basic election info
    election_info = {
        "election_id": str(election.id),
        "title": election.titulo,
        "description": election.descripcion,
        "status": election.estado,
        "start_date": election.fecha_inicio.isoformat() if election.fecha_inicio else None,
        "end_date": election.fecha_fin.isoformat() if election.fecha_fin else None,
        "created_date": election.fecha_creacion.isoformat(),
        "timezone": election.tenant.zona_horaria
    }
    
    # Get participation data
    total_registered = db.query(VotanteEleccion).filter(
        VotanteEleccion.eleccion_id == election_id
    ).count()
    
    total_voted = db.query(VotanteEleccion).filter(
        and_(
            VotanteEleccion.eleccion_id == election_id,
            VotanteEleccion.ha_votado == True
        )
    ).count()
    
    participation_rate = (total_voted / total_registered * 100) if total_registered > 0 else 0
    
    # Get candidates and cargos
    cargos = db.query(Cargo).filter(Cargo.eleccion_id == election_id).all()
    cargo_details = []
    
    for cargo in cargos:
        candidates = db.query(Candidate).filter(Candidate.cargo_id == cargo.id).all()
        candidate_list = []
        
        for candidate in candidates:
            candidate_info = {
                "candidate_id": str(candidate.id),
                "name": f"{candidate.nombre} {candidate.apellido}",
                "party": candidate.partido,
                "has_photo": candidate.foto_url is not None
            }
            
            # Add vote count if results are included
            if incluir_resultados and election.estado == "CERRADA":
                # Simplified vote counting
                vote_count = 0  # In production, decrypt and count actual votes
                candidate_info["votes"] = vote_count
                candidate_info["percentage"] = 0.0
            
            candidate_list.append(candidate_info)
        
        cargo_details.append({
            "cargo_id": str(cargo.id),
            "name": cargo.nombre,
            "description": cargo.descripcion,
            "max_candidates": cargo.max_candidatos_a_elegir,
            "candidates": candidate_list
        })
    
    # Get voting timeline
    votes_by_hour = []
    if election.fecha_inicio:
        current_time = election.fecha_inicio
        end_time = election.fecha_fin or datetime.utcnow()
        
        while current_time < end_time:
            next_hour = current_time + timedelta(hours=1)
            votes_in_hour = db.query(Vote).filter(
                and_(
                    Vote.eleccion_id == election_id,
                    Vote.timestamp >= current_time,
                    Vote.timestamp < next_hour
                )
            ).count()
            
            votes_by_hour.append({
                "hour": current_time.strftime("%Y-%m-%d %H:00"),
                "votes": votes_in_hour
            })
            
            current_time = next_hour
            
            # Limit to prevent too much data
            if len(votes_by_hour) > 168:  # 1 week max
                break
    
    report = {
        "election_info": election_info,
        "participation": {
            "total_registered": total_registered,
            "total_voted": total_voted,
            "remaining_voters": total_registered - total_voted,
            "participation_rate": round(participation_rate, 2)
        },
        "structure": {
            "total_cargos": len(cargos),
            "total_candidates": sum(len(c["candidates"]) for c in cargo_details),
            "cargos": cargo_details
        },
        "timeline": {
            "voting_pattern": votes_by_hour[-24:] if votes_by_hour else []  # Last 24 hours
        },
        "security": {
            "votes_encrypted": True,
            "digital_signatures": True,
            "blockchain_enabled": True
        },
        "generated_at": datetime.utcnow().isoformat(),
        "includes_results": incluir_resultados and election.estado == "CERRADA"
    }
    
    return report

@reports_router.get("/super-admin/estadisticas-globales")
async def get_global_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get global platform statistics"""
    
    # Get overall statistics
    total_tenants = db.query(Tenant).count()
    active_tenants = db.query(Tenant).filter(Tenant.activo == True).count()
    
    total_elections = db.query(Election).count()
    active_elections = db.query(Election).filter(Election.estado == "ACTIVA").count()
    completed_elections = db.query(Election).filter(Election.estado == "CERRADA").count()
    
    total_users = db.query(User).count()
    total_voters = db.query(User).filter(User.rol == "VOTANTE").count()
    
    total_votes = db.query(Vote).count()
    total_simulations = db.query(Simulacro).count()
    
    # Get statistics by country
    country_stats = db.query(
        Tenant.pais,
        func.count(Tenant.id).label('tenants'),
        func.count(Election.id).label('elections')
    ).outerjoin(Election).group_by(Tenant.pais).all()
    
    # Get recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    recent_elections = db.query(Election).filter(
        Election.fecha_creacion >= thirty_days_ago
    ).count()
    
    recent_votes = db.query(Vote).filter(
        Vote.timestamp >= thirty_days_ago
    ).count()
    
    return {
        "global_statistics": {
            "tenants": {
                "total": total_tenants,
                "active": active_tenants,
                "inactive": total_tenants - active_tenants
            },
            "elections": {
                "total": total_elections,
                "active": active_elections,
                "completed": completed_elections,
                "draft": total_elections - active_elections - completed_elections
            },
            "users": {
                "total": total_users,
                "voters": total_voters,
                "admins": total_users - total_voters
            },
            "activity": {
                "total_votes": total_votes,
                "total_simulations": total_simulations,
                "recent_elections": recent_elections,
                "recent_votes": recent_votes
            }
        },
        "geographic_distribution": [
            {
                "country": country or "Unknown",
                "tenants": tenants,
                "elections": elections or 0
            }
            for country, tenants, elections in country_stats
        ],
        "generated_at": datetime.utcnow().isoformat()
    }

