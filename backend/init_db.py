#!/usr/bin/env python3
"""
Script para inicializar la base de datos con datos de prueba
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey
from src.database.database import engine
from src.models.models import Base, Tenant, User, Election, Candidate, Cargo
from src.utils.auth import get_password_hash
from datetime import datetime, timedelta
import uuid

# Create all tables
Base.metadata.create_all(bind=engine)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Create test tenant
    test_tenant = Tenant(
        id=uuid.uuid4(),
        nombre="Organización de Prueba",
        email_contacto="admin@test.com",
        zona_horaria="America/Bogota",
        pais="Colombia",
        activo=True,
        fecha_creacion=datetime.utcnow()
    )
    db.add(test_tenant)
    db.flush()  # To get the ID
    
    # Create super admin user
    super_admin = User(
        id=uuid.uuid4(),
        email="admin@test.com",
        password_hash=get_password_hash("password123"),
        nombre="Super",
        apellido="Administrador",
        rol="SUPER_ADMIN",
        activo=True,
        fecha_creacion=datetime.utcnow()
    )
    db.add(super_admin)
    
    # Create tenant admin user
    tenant_admin = User(
        id=uuid.uuid4(),
        tenant_id=test_tenant.id,
        email="admin@tenant.com",
        password_hash=get_password_hash("admin123"),
        nombre="Admin",
        apellido="Tenant",
        rol="TENANT_ADMIN",
        activo=True,
        fecha_creacion=datetime.utcnow()
    )
    db.add(tenant_admin)
    
    # Create voter user
    voter = User(
        id=uuid.uuid4(),
        tenant_id=test_tenant.id,
        email="voter@test.com",
        password_hash=get_password_hash("voter123"),
        nombre="Juan",
        apellido="Votante",
        rol="VOTANTE",
        activo=True,
        fecha_creacion=datetime.utcnow()
    )
    db.add(voter)
    
    # Create test election
    test_election = Election(
        id=uuid.uuid4(),
        tenant_id=test_tenant.id,
        titulo="Elección de Prueba 2024",
        descripcion="Elección de prueba para demostrar el sistema",
        fecha_inicio=datetime.utcnow() - timedelta(hours=1),  # Started 1 hour ago
        fecha_fin=datetime.utcnow() + timedelta(hours=23),    # Ends in 23 hours
        estado="ACTIVA",
        tipo_votacion="MAYORITARIA",
        anonima=True
    )
    db.add(test_election)
    db.flush()
    
    # Create test cargo (position)
    test_cargo = Cargo(
        id=uuid.uuid4(),
        eleccion_id=test_election.id,
        nombre="Presidente",
        max_candidatos_a_elegir=1
    )
    db.add(test_cargo)
    db.flush()
    
    # Create test candidates
    candidates_data = [
        {
            "nombre": "María",
            "apellido": "González",
            "partido": "Partido Democrático",
            "propuestas": "Propuesta de transparencia y modernización de la gestión organizacional."
        },
        {
            "nombre": "Carlos",
            "apellido": "Rodríguez", 
            "partido": "Movimiento Renovador",
            "propuestas": "Enfoque en la innovación tecnológica y desarrollo sostenible."
        },
        {
            "nombre": "Ana",
            "apellido": "Martínez",
            "partido": "Coalición Progresista",
            "propuestas": "Prioridad en la inclusión social y el bienestar de todos los miembros."
        }
    ]
    
    for i, candidate_data in enumerate(candidates_data, 1):
        candidate = Candidate(
            id=uuid.uuid4(),
            cargo_id=test_cargo.id,
            nombre=candidate_data["nombre"],
            apellido=candidate_data["apellido"],
            descripcion=candidate_data["propuestas"],
            numero_orden=i
        )
        db.add(candidate)
    
    # Commit all changes
    db.commit()
    
    print("✅ Base de datos inicializada exitosamente!")
    print("\n📋 Usuarios creados:")
    print(f"   Super Admin: admin@test.com / password123")
    print(f"   Tenant Admin: admin@tenant.com / admin123") 
    print(f"   Votante: voter@test.com / voter123")
    print("\n🗳️ Elección de prueba creada:")
    print(f"   Título: {test_election.titulo}")
    print(f"   Estado: {test_election.estado}")
    print(f"   Candidatos: {len(candidates_data)} candidatos para Presidente")
    print(f"   Tenant: {test_tenant.nombre}")
    
except Exception as e:
    print(f"❌ Error al inicializar la base de datos: {e}")
    db.rollback()
finally:
    db.close()

