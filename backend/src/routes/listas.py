from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid as uuid_lib
from PIL import Image
from src.database.database import get_db
from src.models.models import ListaPartido
from src.schemas.schemas import ListaPartidoCreate, ListaPartidoUpdate, ListaPartido as ListaPartidoSchema, MessageResponse
from src.utils.dependencies import require_tenant_admin, get_current_active_user
import uuid

listas_router = APIRouter()

# Configuration for logo uploads
UPLOAD_DIR = "uploads/listas"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg"}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB

os.makedirs(UPLOAD_DIR, exist_ok=True)

@listas_router.post("/", response_model=ListaPartidoSchema)
async def create_lista(
    lista_data: ListaPartidoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Create a new lista/partido"""
    # Validate tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != lista_data.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create lista for different tenant"
        )
    
    # Check if lista name already exists for this tenant
    existing_lista = db.query(ListaPartido).filter(
        ListaPartido.tenant_id == lista_data.tenant_id,
        ListaPartido.nombre == lista_data.nombre
    ).first()
    if existing_lista:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lista name already exists for this tenant"
        )
    
    # Create lista
    db_lista = ListaPartido(**lista_data.dict())
    db.add(db_lista)
    db.commit()
    db.refresh(db_lista)
    
    return db_lista

@listas_router.get("/", response_model=List[ListaPartidoSchema])
async def get_listas(
    skip: int = 0,
    limit: int = 100,
    tenant_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get listas/partidos"""
    query = db.query(ListaPartido)
    
    if current_user.rol == "SUPER_ADMIN":
        # Super admin can see all listas
        if tenant_id:
            query = query.filter(ListaPartido.tenant_id == tenant_id)
    else:
        # Other users can only see listas from their tenant
        query = query.filter(ListaPartido.tenant_id == current_user.tenant_id)
    
    listas = query.offset(skip).limit(limit).all()
    return listas

@listas_router.get("/{lista_id}", response_model=ListaPartidoSchema)
async def get_lista(
    lista_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get lista by ID"""
    lista = db.query(ListaPartido).filter(ListaPartido.id == lista_id).first()
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != lista.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access lista from different tenant"
        )
    
    return lista

@listas_router.put("/{lista_id}", response_model=ListaPartidoSchema)
async def update_lista(
    lista_id: uuid.UUID,
    lista_update: ListaPartidoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Update lista/partido"""
    lista = db.query(ListaPartido).filter(ListaPartido.id == lista_id).first()
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != lista.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update lista from different tenant"
        )
    
    # Update lista fields
    update_data = lista_update.dict(exclude_unset=True)
    
    # Check if name is being changed and if it already exists
    if "nombre" in update_data:
        existing_lista = db.query(ListaPartido).filter(
            ListaPartido.tenant_id == lista.tenant_id,
            ListaPartido.nombre == update_data["nombre"],
            ListaPartido.id != lista_id
        ).first()
        if existing_lista:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lista name already exists for this tenant"
            )
    
    for field, value in update_data.items():
        setattr(lista, field, value)
    
    db.commit()
    db.refresh(lista)
    return lista

@listas_router.delete("/{lista_id}", response_model=MessageResponse)
async def delete_lista(
    lista_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Delete lista/partido"""
    lista = db.query(ListaPartido).filter(ListaPartido.id == lista_id).first()
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != lista.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete lista from different tenant"
        )
    
    # Check if lista has candidates
    from src.models.models import Candidate
    candidates_count = db.query(Candidate).filter(Candidate.lista_id == lista_id).count()
    if candidates_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete lista with existing candidates"
        )
    
    # Delete logo file if exists
    if lista.logo_url:
        try:
            os.remove(lista.logo_url)
        except OSError:
            pass  # File might not exist
    
    db.delete(lista)
    db.commit()
    return {"message": "Lista deleted successfully"}

@listas_router.post("/{lista_id}/logo", response_model=MessageResponse)
async def upload_lista_logo(
    lista_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Upload lista logo"""
    lista = db.query(ListaPartido).filter(ListaPartido.id == lista_id).first()
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != lista.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot upload logo for lista from different tenant"
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
            detail="Invalid file format. Allowed: JPG, PNG, WebP, SVG"
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size: 2MB"
        )
    
    # Generate unique filename
    filename = f"{uuid_lib.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save and process image
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Resize and optimize image (skip for SVG)
        if file_ext != ".svg":
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Resize to 200x200 (square logo)
                img.thumbnail((200, 200), Image.Resampling.LANCZOS)
                img.save(file_path, "JPEG", quality=90, optimize=True)
        
        # Delete old logo if exists
        if lista.logo_url:
            try:
                os.remove(lista.logo_url)
            except OSError:
                pass
        
        # Update lista
        lista.logo_url = file_path
        db.commit()
        
        return {"message": "Logo uploaded successfully"}
    
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

@listas_router.delete("/{lista_id}/logo", response_model=MessageResponse)
async def delete_lista_logo(
    lista_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(require_tenant_admin)
):
    """Delete lista logo"""
    lista = db.query(ListaPartido).filter(ListaPartido.id == lista_id).first()
    if not lista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista not found"
        )
    
    # Check tenant access
    if current_user.rol != "SUPER_ADMIN" and current_user.tenant_id != lista.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete logo for lista from different tenant"
        )
    
    if not lista.logo_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No logo found"
        )
    
    # Delete file
    try:
        os.remove(lista.logo_url)
    except OSError:
        pass  # File might not exist
    
    # Update lista
    lista.logo_url = None
    db.commit()
    
    return {"message": "Logo deleted successfully"}

