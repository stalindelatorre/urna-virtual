#!/usr/bin/env python3
"""
Script de prueba para verificar las APIs implementadas en Urna Virtual
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuración
BASE_URL = "http://localhost:5000/api/v1"
TEST_EMAIL = "admin@test.com"
TEST_PASSWORD = "admin123"

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.user_info = None
        self.tenant_id = None
        
    def login(self):
        """Autenticar usuario de prueba"""
        print("🔐 Iniciando sesión...")
        try:
            response = self.session.post(f"{BASE_URL}/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                self.token = data["access_token"]
                self.user_info = data["user"]
                self.tenant_id = data["user"]["tenant_id"]
                
                # Configurar headers para futuras requests
                self.session.headers.update({
                    "Authorization": f"Bearer {self.token}"
                })
                
                print(f"✅ Login exitoso - Usuario: {self.user_info['nombre']} {self.user_info['apellido']}")
                print(f"   Rol: {self.user_info['rol']}")
                print(f"   Tenant ID: {self.tenant_id}")
                return True
            else:
                print(f"❌ Error en login: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error de conexión en login: {e}")
            return False
    
    def test_health(self):
        """Probar endpoint de salud"""
        print("\n🏥 Probando endpoint de salud...")
        try:
            response = requests.get(f"http://localhost:5000/health")
            if response.status_code == 200:
                print("✅ Health check exitoso")
                return True
            else:
                print(f"❌ Health check falló: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error en health check: {e}")
            return False
    
    def test_users_api(self):
        """Probar APIs de usuarios"""
        print("\n👥 Probando APIs de usuarios...")
        
        # GET /users/
        try:
            response = self.session.get(f"{BASE_URL}/users/")
            if response.status_code == 200:
                users = response.json()
                print(f"✅ GET /users/ - {len(users)} usuarios encontrados")
            else:
                print(f"❌ GET /users/ falló: {response.status_code}")
        except Exception as e:
            print(f"❌ Error en GET /users/: {e}")
    
    def test_tenants_api(self):
        """Probar APIs de tenants"""
        print("\n🏢 Probando APIs de tenants...")
        
        # GET /tenants/
        try:
            response = self.session.get(f"{BASE_URL}/tenants/")
            if response.status_code == 200:
                tenants = response.json()
                print(f"✅ GET /tenants/ - {len(tenants)} tenants encontrados")
            else:
                print(f"❌ GET /tenants/ falló: {response.status_code}")
        except Exception as e:
            print(f"❌ Error en GET /tenants/: {e}")
    
    def test_elections_api(self):
        """Probar APIs de elecciones"""
        print("\n🗳️ Probando APIs de elecciones...")
        
        # GET /elecciones/
        try:
            response = self.session.get(f"{BASE_URL}/elecciones/")
            if response.status_code == 200:
                elections = response.json()
                print(f"✅ GET /elecciones/ - {len(elections)} elecciones encontradas")
                return elections
            else:
                print(f"❌ GET /elecciones/ falló: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error en GET /elecciones/: {e}")
            return []
    
    def test_cargos_api(self):
        """Probar APIs de cargos"""
        print("\n📋 Probando APIs de cargos...")
        
        # GET /cargos/
        try:
            response = self.session.get(f"{BASE_URL}/cargos/")
            if response.status_code == 200:
                cargos = response.json()
                print(f"✅ GET /cargos/ - {len(cargos)} cargos encontrados")
            else:
                print(f"❌ GET /cargos/ falló: {response.status_code}")
        except Exception as e:
            print(f"❌ Error en GET /cargos/: {e}")
    
    def test_listas_api(self):
        """Probar APIs de listas"""
        print("\n📝 Probando APIs de listas...")
        
        # GET /listas/
        try:
            response = self.session.get(f"{BASE_URL}/listas/")
            if response.status_code == 200:
                listas = response.json()
                print(f"✅ GET /listas/ - {len(listas)} listas encontradas")
            else:
                print(f"❌ GET /listas/ falló: {response.status_code}")
        except Exception as e:
            print(f"❌ Error en GET /listas/: {e}")
    
    def test_candidates_api(self):
        """Probar APIs de candidatos"""
        print("\n🧑‍💼 Probando APIs de candidatos...")
        
        # GET /candidatos/
        try:
            response = self.session.get(f"{BASE_URL}/candidatos/")
            if response.status_code == 200:
                candidates = response.json()
                print(f"✅ GET /candidatos/ - {len(candidates)} candidatos encontrados")
            else:
                print(f"❌ GET /candidatos/ falló: {response.status_code}")
        except Exception as e:
            print(f"❌ Error en GET /candidatos/: {e}")
    
    def test_metrics_api(self):
        """Probar APIs de métricas"""
        print("\n📊 Probando APIs de métricas...")
        
        # GET /metricas/sistema/salud
        try:
            response = self.session.get(f"{BASE_URL}/metricas/sistema/salud")
            if response.status_code == 200:
                health = response.json()
                print(f"✅ GET /metricas/sistema/salud - Estado: {health.get('system_status', 'unknown')}")
            else:
                print(f"❌ GET /metricas/sistema/salud falló: {response.status_code}")
        except Exception as e:
            print(f"❌ Error en GET /metricas/sistema/salud: {e}")
        
        # GET /metricas/tenant/{tenant_id}/resumen
        if self.tenant_id:
            try:
                response = self.session.get(f"{BASE_URL}/metricas/tenant/{self.tenant_id}/resumen")
                if response.status_code == 200:
                    summary = response.json()
                    print(f"✅ GET /metricas/tenant/resumen - Tenant: {summary.get('tenant_name', 'unknown')}")
                else:
                    print(f"❌ GET /metricas/tenant/resumen falló: {response.status_code}")
            except Exception as e:
                print(f"❌ Error en GET /metricas/tenant/resumen: {e}")
    
    def test_reports_api(self):
        """Probar APIs de reportes"""
        print("\n📈 Probando APIs de reportes...")
        
        # Solo para super admin
        if self.user_info and self.user_info.get('rol') == 'SUPER_ADMIN':
            # GET /reports/super-admin/estadisticas-globales
            try:
                response = self.session.get(f"{BASE_URL}/reports/super-admin/estadisticas-globales")
                if response.status_code == 200:
                    stats = response.json()
                    print(f"✅ GET /reports/super-admin/estadisticas-globales - Tenants: {stats.get('global_statistics', {}).get('tenants', {}).get('total', 0)}")
                else:
                    print(f"❌ GET /reports/super-admin/estadisticas-globales falló: {response.status_code}")
            except Exception as e:
                print(f"❌ Error en GET /reports/super-admin/estadisticas-globales: {e}")
        else:
            print("ℹ️ Reportes de super admin requieren rol SUPER_ADMIN")
    
    def run_all_tests(self):
        """Ejecutar todas las pruebas"""
        print("🚀 Iniciando pruebas de APIs de Urna Virtual")
        print("=" * 50)
        
        # Verificar que el servidor esté corriendo
        if not self.test_health():
            print("❌ El servidor no está disponible. Abortando pruebas.")
            return False
        
        # Autenticar
        if not self.login():
            print("❌ No se pudo autenticar. Abortando pruebas.")
            return False
        
        # Ejecutar pruebas de APIs
        self.test_users_api()
        self.test_tenants_api()
        self.test_elections_api()
        self.test_cargos_api()
        self.test_listas_api()
        self.test_candidates_api()
        self.test_metrics_api()
        self.test_reports_api()
        
        print("\n" + "=" * 50)
        print("✅ Pruebas completadas")
        return True

def main():
    """Función principal"""
    tester = APITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

