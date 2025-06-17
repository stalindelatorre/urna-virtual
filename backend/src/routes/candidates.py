from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os
import uuid as uuid_lib
from PIL import Image
from src.database.database import get_db
from src.models.models import Candidate, Cargo, Election, ListaPartido
from src.schemas.schemas import CandidateCreate, CandidateUpdate, Candidate as CandidateSchema, MessageResponse
from src.utils.dependencies import require_tenant_admin, get_current_active_user
import uuid

candidates_router = APIRouter()

# Configuration for image uploads
UPLOAD_DIR = "uploads/candidates"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

os.makedirs(UPLOAD_DIR, exist_ok=True)

@candidates_router.post("/", response_model=CandidateSchema)
async def create_candidate(
    candidate_data: CandidateCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Create a new candidate"""
    # Validate cargo exists and belongs to user's tenant
    cargo = db.query(Cargo).join(Election).filter(Cargo.id == candidate_data.cargo_id).first()
    if not cargo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cargo not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create candidate for different tenant"
        )
    
    # Validate lista if provided
    if candidate_data.lista_id:
        lista = db.query(ListaPartido).filter(ListaPartido.id == candidate_data.lista_id).first()
        if not lista or lista.tenant_id != cargo.eleccion.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lista not found or belongs to different tenant"
            )
    
    # Check if numero_orden is unique for this cargo
    existing_candidate = db.query(Candidate).filter(
        Candidate.cargo_id == candidate_data.cargo_id,
        Candidate.numero_orden == candidate_data.numero_orden
    ).first()
    if existing_candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Numero de orden already exists for this cargo"
        )
    
    # Create candidate
    db_candidate = Candidate(**candidate_data.dict())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    
    return db_candidate

@candidates_router.get("/", response_model=List[CandidateSchema])
async def get_candidates(
    cargo_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get candidates"""
    query = db.query(Candidate).join(Cargo).join(Election)
    
    if current_user.rol != "SUPER_ADMIN":
        # Filter by tenant
        query = query.filter(Election.tenant_id == current_user.tenant_id)
    
    if cargo_id:
        query = query.filter(Candidate.cargo_id == cargo_id)
    
    candidates = query.offset(skip).limit(limit).all()
    return candidates

@candidates_router.get("/{candidate_id}", response_model=CandidateSchema)
async def get_candidate(
    candidate_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get candidate by ID"""
    candidate = db.query(Candidate).join(Cargo).join(Election).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != candidate.cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access candidate from different tenant"
        )
    
    return candidate

@candidates_router.put("/{candidate_id}", response_model=CandidateSchema)
async def update_candidate(
    candidate_id: uuid.UUID,
    candidate_update: CandidateUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Update candidate"""
    candidate = db.query(Candidate).join(Cargo).join(Election).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != candidate.cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update candidate from different tenant"
        )
    
    # Cannot update if election is active or closed
    if candidate.cargo.eleccion.estado in ["ACTIVA", "CERRADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update candidate in active or closed election"
        )
    
    # Update candidate fields
    update_data = candidate_update.dict(exclude_unset=True)
    
    # Validate numero_orden if provided
    if "numero_orden" in update_data:
        existing_candidate = db.query(Candidate).filter(
            Candidate.cargo_id == candidate.cargo_id,
            Candidate.numero_orden == update_data["numero_orden"],
            Candidate.id != candidate_id
        ).first()
        if existing_candidate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Numero de orden already exists for this cargo"
            )
    
    # Validate lista if provided
    if "lista_id" in update_data and update_data["lista_id"]:
        lista = db.query(ListaPartido).filter(ListaPartido.id == update_data["lista_id"]).first()
        if not lista or lista.tenant_id != candidate.cargo.eleccion.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lista not found or belongs to different tenant"
            )
    
    for field, value in update_data.items():
        setattr(candidate, field, value)
    
    db.commit()
    db.refresh(candidate)
    return candidate

@candidates_router.delete("/{candidate_id}", response_model=MessageResponse)
async def delete_candidate(
    candidate_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Delete candidate"""
    candidate = db.query(Candidate).join(Cargo).join(Election).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != candidate.cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete candidate from different tenant"
        )
    
    # Cannot delete if election is active or closed
    if candidate.cargo.eleccion.estado in ["ACTIVA", "CERRADA"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete candidate in active or closed election"
        )
    
    # Delete photo file if exists
    if candidate.foto_url:
        try:
            os.remove(candidate.foto_url)
        except OSError:
            pass  # File might not exist
    
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}

@candidates_router.post("/{candidate_id}/foto", response_model=MessageResponse)
async def upload_candidate_photo(
    candidate_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Upload candidate photo"""
    candidate = db.query(Candidate).join(Cargo).join(Election).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != candidate.cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot upload photo for candidate from different tenant"
        )
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Allowed: JPG, PNG, WebP"
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size: 5MB"
        )
    
    # Generate unique filename
    filename = f"{uuid_lib.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save and process image
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Resize and optimize image
        with Image.open(file_path) as img:
            # Convert to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Resize to 300x400 (3:4 ratio)
            img.thumbnail((300, 400), Image.Resampling.LANCZOS)
            img.save(file_path, "JPEG", quality=85, optimize=True)
        
        # Delete old photo if exists
        if candidate.foto_url:
            try:
                os.remove(candidate.foto_url)
            except OSError:
                pass
        
        # Update candidate
        candidate.foto_url = file_path
        db.commit()
        
        return {"message": "Photo uploaded successfully"}
    
    except Exception as e:
        # Clean up file if error occurred
        try:
            os.remove(file_path)
        except OSError:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing image"
        )

@candidates_router.delete("/{candidate_id}/foto", response_model=MessageResponse)
async def delete_candidate_photo(
    candidate_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Delete candidate photo"""
    candidate = db.query(Candidate).join(Cargo).join(Election).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != candidate.cargo.eleccion.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete photo for candidate from different tenant"
        )
    
    if not candidate.foto_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No photo found"
        )
    
    # Delete file
    try:
        os.remove(candidate.foto_url)
    except OSError:
        pass  # File might not exist
    
    # Update candidate
    candidate.foto_url = None
    db.commit()
    
    return {"message": "Photo deleted successfully"}

