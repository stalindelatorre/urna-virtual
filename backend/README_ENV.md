# 🔧 Configuración de Variables de Entorno - Urna Virtual

## 📋 Archivos de Configuración

### Archivos Disponibles

| Archivo | Propósito | Uso |
|---------|-----------|-----|
| `.env.example` | Plantilla completa con todas las variables | Referencia y documentación |
| `.env.development` | Configuración para desarrollo local | Desarrollo y pruebas |
| `.env.production` | Configuración para producción | Despliegue en servidor |
| `.env` | Tu configuración personal | Crear basado en los ejemplos |

## 🚀 Configuración Rápida

### Para Desarrollo Local

1. **Copia el archivo de desarrollo:**
   ```bash
   cp .env.development .env
   ```

2. **Instala dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ejecuta el servidor:**
   ```bash
   python src/main.py
   ```

### Para Producción

1. **Copia el archivo de producción:**
   ```bash
   cp .env.production .env
   ```

2. **⚠️ IMPORTANTE - Cambia las claves secretas:**
   ```bash
   # Generar clave JWT
   openssl rand -hex 32
   
   # Generar clave de cifrado
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

3. **Configura PostgreSQL:**
   ```bash
   # Edita .env y cambia:
   DATABASE_URL=postgresql://usuario:password@host:puerto/database
   ```

## 🔐 Variables Críticas de Seguridad

### ⚠️ CAMBIAR OBLIGATORIAMENTE EN PRODUCCIÓN

```bash
# Clave secreta JWT (generar nueva)
JWT_SECRET_KEY=tu_clave_jwt_muy_segura

# Clave de cifrado de votos (generar nueva)
VOTE_ENCRYPTION_KEY=tu_clave_cifrado_muy_segura

# URL de base de datos PostgreSQL
DATABASE_URL=postgresql://user:pass@host:port/db
```

## 🗄️ Configuración de Base de Datos

### SQLite (Desarrollo)
```bash
DATABASE_URL=sqlite:///./urna_virtual.db
```

### PostgreSQL (Producción Recomendada)
```bash
DATABASE_URL=postgresql://urna_user:password@localhost:5432/urna_virtual_db
```

### MySQL (Alternativa)
```bash
DATABASE_URL=mysql+pymysql://urna_user:password@localhost:3306/urna_virtual_db
```

## 📧 Configuración de Email

### Gmail (Desarrollo)
```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
```

### SendGrid (Producción)
```bash
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=tu_sendgrid_api_key
```

## 🔒 Configuración de Seguridad

### Rate Limiting
```bash
# Desarrollo (permisivo)
RATE_LIMIT_LOGIN=10
RATE_LIMIT_GENERAL=1000

# Producción (estricto)
RATE_LIMIT_LOGIN=3
RATE_LIMIT_GENERAL=60
```

### Timeouts de Sesión
```bash
# Desarrollo
SESSION_TIMEOUT_MINUTES=120

# Producción
SESSION_TIMEOUT_MINUTES=15
```

## 🌐 Configuración de CORS

### Desarrollo
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Producción
```bash
ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

## 📁 Configuración de Archivos

### Desarrollo
```bash
UPLOAD_DIRECTORY=./uploads
MAX_FILE_SIZE_MB=10
```

### Producción
```bash
UPLOAD_DIRECTORY=/var/urna-virtual/uploads
MAX_FILE_SIZE_MB=2
```

## 📊 Configuración de Logging

### Desarrollo
```bash
LOG_LEVEL=DEBUG
LOG_FILE=./logs/urna_virtual_dev.log
```

### Producción
```bash
LOG_LEVEL=WARNING
LOG_FILE=/var/log/urna-virtual/urna_virtual.log
```

## ☁️ Servicios en la Nube (Opcional)

### AWS S3
```bash
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_BUCKET_NAME=urna-virtual-files
AWS_REGION=us-east-1
```

### Redis
```bash
# Local
REDIS_URL=redis://localhost:6379/0

# Cloud (Redis Labs, AWS ElastiCache, etc.)
REDIS_URL=redis://usuario:password@host:puerto/0
```

## 🛠️ Comandos Útiles

### Generar Claves Seguras
```bash
# Clave JWT (32 bytes hex)
openssl rand -hex 32

# Clave de cifrado (Python)
python -c "import secrets; print(secrets.token_hex(32))"

# UUID para identificadores
python -c "import uuid; print(str(uuid.uuid4()))"
```

### Verificar Configuración
```bash
# Verificar variables críticas
python -c "
import os
print('DATABASE_URL:', bool(os.getenv('DATABASE_URL')))
print('JWT_SECRET_KEY:', bool(os.getenv('JWT_SECRET_KEY')))
print('VOTE_ENCRYPTION_KEY:', bool(os.getenv('VOTE_ENCRYPTION_KEY')))
"
```

### Probar Conexión a Base de Datos
```bash
python -c "
from src.database.database import engine
try:
    engine.connect()
    print('✅ Conexión a base de datos exitosa')
except Exception as e:
    print(f'❌ Error de conexión: {e}')
"
```

## 🔍 Troubleshooting

### Error: "No module named 'psycopg2'"
```bash
# Instalar driver PostgreSQL
pip install psycopg2-binary
```

### Error: "Access denied for user"
```bash
# Verificar credenciales en DATABASE_URL
# Verificar que el usuario tenga permisos
# Verificar que la base de datos exista
```

### Error: "CORS policy"
```bash
# Verificar ALLOWED_ORIGINS en .env
# Asegurar que incluye el dominio del frontend
```

### Error: "JWT decode error"
```bash
# Verificar que JWT_SECRET_KEY esté configurado
# Verificar que no haya espacios en la clave
```

## 📋 Checklist de Configuración

### Desarrollo ✅
- [ ] Copiar `.env.development` a `.env`
- [ ] Verificar que SQLite funciona
- [ ] Probar login con usuario de prueba
- [ ] Verificar que el frontend se conecta

### Producción ✅
- [ ] Copiar `.env.production` a `.env`
- [ ] Cambiar `JWT_SECRET_KEY`
- [ ] Cambiar `VOTE_ENCRYPTION_KEY`
- [ ] Configurar PostgreSQL
- [ ] Configurar SMTP real
- [ ] Configurar dominio en `ALLOWED_ORIGINS`
- [ ] Configurar certificados SSL
- [ ] Configurar backups
- [ ] Configurar monitoreo
- [ ] Probar todas las funcionalidades
- [ ] Realizar pruebas de seguridad

## 🆘 Soporte

Si tienes problemas con la configuración:

1. **Revisa los logs:** `tail -f logs/urna_virtual.log`
2. **Verifica las variables:** Usa los comandos de verificación
3. **Consulta la documentación:** Revisa `docs/`
4. **Prueba paso a paso:** Usa configuración mínima primero

## 🔐 Seguridad

### ⚠️ NUNCA hagas esto:
- Subir archivos `.env` al repositorio
- Usar claves por defecto en producción
- Compartir credenciales por email/chat
- Usar HTTP en producción

### ✅ SIEMPRE haz esto:
- Usar HTTPS en producción
- Cambiar todas las claves por defecto
- Usar contraseñas fuertes
- Mantener backups actualizados
- Monitorear logs de seguridad

