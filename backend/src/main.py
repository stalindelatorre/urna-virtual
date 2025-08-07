import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

# Import routes
from src.routes.auth import auth_router
from src.routes.tenants import tenants_router
from src.routes.users import users_router
from src.routes.elections import elections_router
from src.routes.candidates import candidates_router
from src.routes.cargos import cargos_router
from src.routes.listas import listas_router
from src.routes.votes import votes_router
from src.routes.simulacros import simulacros_router
from src.routes.metrics import metrics_router
from src.routes.reports import reports_router

# Import database
from src.database.database import engine, Base

# Create FastAPI app
app = FastAPI(
    title="Urna Virtual API",
    description="API REST para el sistema de voto electrónico Urna Virtual",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(tenants_router, prefix="/api/v1/tenants", tags=["Tenants"])
app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
app.include_router(elections_router, prefix="/api/v1/elecciones", tags=["Elections"])
app.include_router(candidates_router, prefix="/api/v1/candidatos", tags=["Candidates"])
app.include_router(cargos_router, prefix="/api/v1/cargos", tags=["Cargos"])
app.include_router(listas_router, prefix="/api/v1/listas", tags=["Listas"])
app.include_router(votes_router, prefix="/api/v1/votos", tags=["Votes"])
app.include_router(simulacros_router, prefix="/api/v1/simulacros", tags=["Simulacros"])
app.include_router(metrics_router, prefix="/api/v1/metricas", tags=["Metrics"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["Reports"])

# Serve static files
static_folder = os.path.join(os.path.dirname(__file__), 'static')
if os.path.exists(static_folder):
    app.mount("/static", StaticFiles(directory=static_folder), name="static")

@app.get("/")
async def serve_frontend():
    """Serve the frontend application"""
    index_path = os.path.join(static_folder, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Urna Virtual API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Urna Virtual API"}

if __name__ == '__main__':
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )

