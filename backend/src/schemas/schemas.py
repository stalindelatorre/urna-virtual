from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    TENANT_ADMIN = "TENANT_ADMIN"
    VOTANTE = "VOTANTE"

class ElectionStatus(str, Enum):
    PENDIENTE = "PENDIENTE"
    ACTIVA = "ACTIVA"
    CERRADA = "CERRADA"
    CANCELADA = "CANCELADA"

class VotationType(str, Enum):
    MAYORITARIA = "MAYORITARIA"
    PONDERADA = "PONDERADA"

# Base schemas
class TenantBase(BaseModel):
    nombre: str
    email_contacto: EmailStr
    zona_horaria: str = "UTC"
    pais: Optional[str] = None

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    nombre: Optional[str] = None
    email_contacto: Optional[EmailStr] = None
    zona_horaria: Optional[str] = None
    pais: Optional[str] = None
    activo: Optional[bool] = None

class Tenant(TenantBase):
    id: uuid.UUID
    fecha_creacion: datetime
    activo: bool
    
    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    nombre: str
    apellido: str
    rol: UserRole
    tenant_id: Optional[uuid.UUID] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    activo: Optional[bool] = None

class User(UserBase):
    id: uuid.UUID
    fecha_creacion: datetime
    activo: bool
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[uuid.UUID] = None
    tenant_id: Optional[uuid.UUID] = None
    rol: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Lista/Partido schemas
class ListaPartidoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    color_primario: Optional[str] = None

class ListaPartidoCreate(ListaPartidoBase):
    tenant_id: uuid.UUID

class ListaPartidoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    color_primario: Optional[str] = None

class ListaPartido(ListaPartidoBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    logo_url: Optional[str] = None
    
    class Config:
        from_attributes = True

# Election schemas
class ElectionBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: datetime
    tipo_votacion: VotationType
    anonima: bool = True

class ElectionCreate(ElectionBase):
    tenant_id: uuid.UUID

class ElectionUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    tipo_votacion: Optional[VotationType] = None
    anonima: Optional[bool] = None

class Election(ElectionBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    estado: ElectionStatus
    
    class Config:
        from_attributes = True

# Cargo schemas
class CargoBase(BaseModel):
    nombre: str
    max_candidatos_a_elegir: int

class CargoCreate(CargoBase):
    eleccion_id: uuid.UUID

class Cargo(CargoBase):
    id: uuid.UUID
    eleccion_id: uuid.UUID
    
    class Config:
        from_attributes = True

# Candidate schemas
class CandidateBase(BaseModel):
    nombre: str
    apellido: str
    descripcion: Optional[str] = None
    numero_orden: int

class CandidateCreate(CandidateBase):
    cargo_id: uuid.UUID
    lista_id: Optional[uuid.UUID] = None

class CandidateUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    descripcion: Optional[str] = None
    numero_orden: Optional[int] = None
    lista_id: Optional[uuid.UUID] = None

class Candidate(CandidateBase):
    id: uuid.UUID
    cargo_id: uuid.UUID
    lista_id: Optional[uuid.UUID] = None
    foto_url: Optional[str] = None
    
    class Config:
        from_attributes = True

# Vote schemas
class VoteCreate(BaseModel):
    eleccion_id: uuid.UUID
    candidatos_seleccionados: List[uuid.UUID]

class Vote(BaseModel):
    id: uuid.UUID
    eleccion_id: uuid.UUID
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Simulacro schemas
class SimulacroBase(BaseModel):
    nombre: str

class SimulacroCreate(SimulacroBase):
    eleccion_id: uuid.UUID

class Simulacro(SimulacroBase):
    id: uuid.UUID
    eleccion_id: uuid.UUID
    fecha_creacion: datetime
    activo: bool
    
    class Config:
        from_attributes = True

# Metrics schemas
class MetricasEleccion(BaseModel):
    participacion_porcentaje: float
    votantes_restantes: int
    tiempo_restante_minutos: int
    estado_sistema: str

class MetricasUso(BaseModel):
    tenant_id: uuid.UUID
    periodo: datetime
    elecciones_creadas: int
    elecciones_completadas: int
    votantes_empadronados: int
    votos_emitidos: int
    almacenamiento_mb: float
    
    class Config:
        from_attributes = True

# Response schemas
class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


# Additional schemas for new APIs
class VoteCreate(BaseModel):
    eleccion_id: uuid.UUID
    candidatos_seleccionados: List[uuid.UUID]

class SimulacroCreate(BaseModel):
    eleccion_id: uuid.UUID
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True

class Simulacro(BaseModel):
    id: uuid.UUID
    eleccion_id: uuid.UUID
    nombre: str
    descripcion: Optional[str]
    activo: bool
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True

