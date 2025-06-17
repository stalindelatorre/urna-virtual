from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from src.database.database import Base

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    nombre = Column(String(255), nullable=False, unique=True)
    email_contacto = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    zona_horaria = Column(String(50), default='UTC', nullable=False)
    pais = Column(String(100), nullable=True)
    
    # Relationships
    usuarios = relationship("User", back_populates="tenant")
    elecciones = relationship("Election", back_populates="tenant")
    listas_partidos = relationship("ListaPartido", back_populates="tenant")
    metricas_uso = relationship("MetricaUso", back_populates="tenant")

class User(Base):
    __tablename__ = "usuarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=True)  # NULL for super admin
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)  # SUPER_ADMIN, TENANT_ADMIN, VOTANTE
    nombre = Column(String(255), nullable=False)
    apellido = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="usuarios")
    votos = relationship("Vote", back_populates="votante")
    votantes_eleccion = relationship("VotanteEleccion", back_populates="votante")

class ListaPartido(Base):
    __tablename__ = "listas_partidos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    color_primario = Column(String(7), nullable=True)  # Formato hexadecimal
    
    # Relationships
    tenant = relationship("Tenant", back_populates="listas_partidos")
    candidatos = relationship("Candidate", back_populates="lista")

class Election(Base):
    __tablename__ = "elecciones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False)
    fecha_fin = Column(DateTime(timezone=True), nullable=False)
    estado = Column(String(50), nullable=False)  # PENDIENTE, ACTIVA, CERRADA, CANCELADA
    tipo_votacion = Column(String(50), nullable=False)  # MAYORITARIA, PONDERADA
    anonima = Column(Boolean, nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="elecciones")
    cargos = relationship("Cargo", back_populates="eleccion")
    votos = relationship("Vote", back_populates="eleccion")
    simulacros = relationship("Simulacro", back_populates="eleccion")
    votantes_eleccion = relationship("VotanteEleccion", back_populates="eleccion")

class Cargo(Base):
    __tablename__ = "cargos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    eleccion_id = Column(UUID(as_uuid=True), ForeignKey("elecciones.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    max_candidatos_a_elegir = Column(Integer, nullable=False)
    
    # Relationships
    eleccion = relationship("Election", back_populates="cargos")
    candidatos = relationship("Candidate", back_populates="cargo")

class Candidate(Base):
    __tablename__ = "candidatos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    cargo_id = Column(UUID(as_uuid=True), ForeignKey("cargos.id"), nullable=False)
    lista_id = Column(UUID(as_uuid=True), ForeignKey("listas_partidos.id"), nullable=True)
    nombre = Column(String(255), nullable=False)
    apellido = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    foto_url = Column(String(500), nullable=True)
    numero_orden = Column(Integer, nullable=False)
    
    # Relationships
    cargo = relationship("Cargo", back_populates="candidatos")
    lista = relationship("ListaPartido", back_populates="candidatos")

class Vote(Base):
    __tablename__ = "votos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    eleccion_id = Column(UUID(as_uuid=True), ForeignKey("elecciones.id"), nullable=False)
    votante_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    voto_cifrado = Column(Text, nullable=False)
    firma_digital = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    hash_bloque = Column(String(255), nullable=True)
    
    # Relationships
    eleccion = relationship("Election", back_populates="votos")
    votante = relationship("User", back_populates="votos")

class VotanteEleccion(Base):
    __tablename__ = "votantes_eleccion"
    
    eleccion_id = Column(UUID(as_uuid=True), ForeignKey("elecciones.id"), primary_key=True, nullable=False)
    votante_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), primary_key=True, nullable=False)
    ha_votado = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    eleccion = relationship("Election", back_populates="votantes_eleccion")
    votante = relationship("User", back_populates="votantes_eleccion")

class Simulacro(Base):
    __tablename__ = "simulacros"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    eleccion_id = Column(UUID(as_uuid=True), ForeignKey("elecciones.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    eleccion = relationship("Election", back_populates="simulacros")
    votos_simulacro = relationship("VotoSimulacro", back_populates="simulacro")

class VotoSimulacro(Base):
    __tablename__ = "votos_simulacro"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    simulacro_id = Column(UUID(as_uuid=True), ForeignKey("simulacros.id"), nullable=False)
    votante_prueba = Column(String(255), nullable=False)
    voto_cifrado = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    simulacro = relationship("Simulacro", back_populates="votos_simulacro")

class MetricaUso(Base):
    __tablename__ = "metricas_uso"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    periodo = Column(DateTime, nullable=False)  # año-mes
    elecciones_creadas = Column(Integer, default=0, nullable=False)
    elecciones_completadas = Column(Integer, default=0, nullable=False)
    votantes_empadronados = Column(Integer, default=0, nullable=False)
    votos_emitidos = Column(Integer, default=0, nullable=False)
    almacenamiento_mb = Column(DECIMAL(10, 2), default=0, nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="metricas_uso")

