# Diseño Técnico y Arquitectura de Urna Virtual

## 1. Introducción

Este documento detalla el diseño técnico y la arquitectura de "Urna Virtual", la aplicación web SaaS de voto electrónico. Se abordarán los componentes clave del sistema, las tecnologías seleccionadas, la estructura de la base de datos, el diseño de las APIs y las consideraciones de despliegue y escalabilidad. El objetivo es establecer una base técnica sólida que garantice la seguridad, el rendimiento y la mantenibilidad de la aplicación.

## 2. Arquitectura General del Sistema

"Urna Virtual" seguirá una arquitectura de microservicios o una arquitectura modular bien definida, separando claramente el frontend del backend y utilizando APIs REST para la comunicación. La arquitectura será multitenant, lo que significa que una única instancia de la aplicación servirá a múltiples organizaciones de forma aislada y segura.

### 2.1. Componentes Principales

*   **Frontend (Cliente Web):** Desarrollado con React.js y TypeScript, será la interfaz de usuario con la que interactuarán los Super Administradores, Administradores de Tenant y Votantes. Se encargará de la presentación de datos y la interacción con el usuario.
*   **Backend (Servicios API):** Desarrollado con Python, expondrá APIs RESTful para manejar la lógica de negocio, la persistencia de datos, la autenticación, la autorización y las operaciones criptográficas relacionadas con el voto. Este componente será el cerebro de la aplicación.
*   **Base de Datos:** Almacenará todos los datos de la aplicación, incluyendo información de tenants, usuarios, elecciones, candidatos y votos. Se implementará con un enfoque multitenant para garantizar el aislamiento de datos.
*   **Mecanismo de Voto Criptográfico:** Un módulo central dentro del backend que implementará las lógicas de unicidad, secreto, inviolabilidad e intransferibilidad del voto, posiblemente utilizando técnicas avanzadas de criptografía.

### 2.2. Diagrama de Arquitectura (Conceptual)

```mermaid
graph TD
    A[Usuario (Super Admin, Admin Tenant, Votante)] -->|Accede vía Navegador Web| B(Frontend React.js/TypeScript)
    B -->|Llamadas API REST (HTTPS)| C(Backend Python API)
    C -->|Consultas/Escrituras| D(Base de Datos PostgreSQL)
    C -->|Manejo de Voto| E(Módulo Criptográfico de Voto)
    E -->|Almacenamiento Seguro| D
    C -->|Logs/Auditoría| F(Sistema de Logs/Auditoría)
    F -->|Almacenamiento| G(Almacenamiento de Logs)
```




## 3. Tecnologías Seleccionadas

### 3.1. Frontend: React.js con TypeScript

*   **React.js:** Una biblioteca de JavaScript declarativa, eficiente y flexible para construir interfaces de usuario. Su enfoque basado en componentes facilita el desarrollo y la reutilización de código.
*   **TypeScript:** Un superconjunto de JavaScript que añade tipado estático. Esto mejora la calidad del código, facilita la detección de errores en tiempo de desarrollo y mejora la mantenibilidad de proyectos grandes.
*   **Gestión de Estado:** Se considerará el uso de Redux, Zustand o React Context API para la gestión centralizada del estado de la aplicación, dependiendo de la complejidad y las necesidades específicas.
*   **Librerías de UI:** Se evaluarán librerías de componentes UI como Material-UI, Ant Design o Chakra UI para acelerar el desarrollo y asegurar una experiencia de usuario consistente.

### 3.2. Backend: Python

*   **Framework Web:**
    *   **FastAPI:** Un framework web moderno, rápido (alto rendimiento) para construir APIs con Python 3.7+ basado en tipos estándar de Python. Ofrece validación de datos, serialización y documentación automática (OpenAPI/Swagger UI), lo que lo hace ideal para APIs RESTful.
    *   **Alternativas (consideradas y descartadas por razones específicas):**
        *   **Django REST Framework:** Potente y maduro, pero podría ser excesivo para una API pura si no se necesita toda la funcionalidad de Django.
        *   **Flask:** Ligero y flexible, pero FastAPI ofrece ventajas significativas en rendimiento y tipado con menos configuración.
*   **Base de Datos ORM:**
    *   **SQLAlchemy:** Un potente y flexible ORM (Object Relational Mapper) que permite interactuar con bases de datos relacionales utilizando objetos Python. Proporciona una abstracción robusta y es compatible con múltiples bases de datos.
*   **Manejo de Dependencias:** Poetry o Pipenv para la gestión de dependencias y entornos virtuales.
*   **Servidor Web (Producción):** Gunicorn o Uvicorn (para FastAPI) como servidor WSGI/ASGI, y Nginx como proxy inverso para manejar solicitudes, SSL y balanceo de carga.

### 3.3. Base de Datos: PostgreSQL

*   **PostgreSQL:** Una base de datos relacional de código abierto, robusta, escalable y con un fuerte enfoque en la integridad de los datos. Es ideal para aplicaciones que requieren alta fiabilidad y soporte para transacciones complejas. Su soporte para JSONB también puede ser útil para ciertos tipos de datos.

### 3.4. Autenticación y Autorización: JWT (JSON Web Tokens)

*   **JWT:** Se utilizarán JWTs para la autenticación y gestión de sesiones. Los tokens serán firmados digitalmente para asegurar su integridad y se implementarán mecanismos de refresco y revocación para mejorar la seguridad.
*   **OAuth2/OpenID Connect:** Se considerará la integración con un proveedor de identidad externo (IdP) si se requiere un inicio de sesión único (SSO) o una gestión de identidad más avanzada en el futuro.

### 3.5. Herramientas de Desarrollo y DevOps

*   **Control de Versiones:** Git y GitHub/GitLab para la gestión del código fuente y la colaboración.
*   **Contenedores:** Docker para la contenerización de la aplicación, facilitando el despliegue y asegurando la consistencia del entorno.
*   **Orquestación (futuro):** Kubernetes para la orquestación de contenedores en entornos de producción a gran escala.
*   **CI/CD:** GitHub Actions, GitLab CI/CD o Jenkins para la integración continua y el despliegue continuo.
*   **Monitoreo y Logging:** Prometheus/Grafana para monitoreo de métricas y ELK Stack (Elasticsearch, Logstash, Kibana) o Grafana Loki para la gestión centralizada de logs.




## 4. Diseño de la Base de Datos

La base de datos PostgreSQL será el componente central para la persistencia de datos en "Urna Virtual". El diseño de la base de datos se centrará en el soporte multitenant, la integridad referencial y la optimización para el rendimiento y la seguridad. A continuación, se presenta un esquema conceptual de las tablas principales.

### 4.1. Estrategia Multitenant

Se utilizará una estrategia de "esquema compartido con columna de discriminación" (Shared Schema, Discriminator Column). Esto significa que todas las tablas contendrán una columna `tenant_id` que identificará a qué organización pertenecen los datos. Esta es una solución equilibrada que ofrece un buen aislamiento lógico con una gestión de infraestructura simplificada.

### 4.2. Esquema de Tablas (Conceptual)

#### Tabla `tenants`

Almacena la información de cada organización que utiliza la plataforma.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único del tenant            |
| `nombre`        | VARCHAR(255) | NOT NULL, UNIQUE      | Nombre de la organización                 |
| `email_contacto`| VARCHAR(255) | NOT NULL              | Email de contacto principal del tenant    |
| `fecha_creacion`| TIMESTAMP    | NOT NULL, DEFAULT NOW() | Fecha y hora de creación del tenant       |
| `activo`        | BOOLEAN      | NOT NULL, DEFAULT TRUE | Indica si el tenant está activo o no      |

#### Tabla `usuarios`

Almacena la información de todos los usuarios del sistema (Super Administradores, Administradores de Tenant, Votantes).

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único del usuario           |
| `tenant_id`     | UUID         | FK a `tenants.id`, NULLABLE | Identificador del tenant al que pertenece (NULL para Super Admin) |
| `email`         | VARCHAR(255) | NOT NULL, UNIQUE      | Email del usuario (usado para login)      |
| `password_hash` | VARCHAR(255) | NOT NULL              | Hash de la contraseña del usuario         |
| `rol`           | ENUM         | NOT NULL              | Rol del usuario (SUPER_ADMIN, TENANT_ADMIN, VOTANTE) |
| `nombre`        | VARCHAR(255) | NOT NULL              | Nombre del usuario                        |
| `apellido`      | VARCHAR(255) | NOT NULL              | Apellido del usuario                      |
| `fecha_creacion`| TIMESTAMP    | NOT NULL, DEFAULT NOW() | Fecha y hora de creación del usuario      |
| `activo`        | BOOLEAN      | NOT NULL, DEFAULT TRUE | Indica si el usuario está activo o no     |

#### Tabla `elecciones`

Almacena la información de cada elección creada por un Administrador de Tenant.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único de la elección        |
| `tenant_id`     | UUID         | FK a `tenants.id`, NOT NULL | Identificador del tenant propietario de la elección |
| `titulo`        | VARCHAR(255) | NOT NULL              | Título de la elección                     |
| `descripcion`   | TEXT         | NULLABLE              | Descripción detallada de la elección      |
| `fecha_inicio`  | TIMESTAMP    | NOT NULL              | Fecha y hora de inicio de la votación     |
| `fecha_fin`     | TIMESTAMP    | NOT NULL              | Fecha y hora de fin de la votación        |
| `estado`        | ENUM         | NOT NULL              | Estado actual de la elección (PENDIENTE, ACTIVA, CERRADA, CANCELADA) |
| `tipo_votacion` | ENUM         | NOT NULL              | Tipo de votación (ej. MAYORITARIA, PONDERADA) |
| `anonima`       | BOOLEAN      | NOT NULL              | Indica si la votación es anónima          |

#### Tabla `cargos`

Define los cargos a elegir dentro de una elección.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único del cargo             |
| `eleccion_id`   | UUID         | FK a `elecciones.id`, NOT NULL | Elección a la que pertenece el cargo      |
| `nombre`        | VARCHAR(255) | NOT NULL              | Nombre del cargo (ej. Presidente, Vocal)  |
| `max_candidatos_a_elegir` | INTEGER | NOT NULL              | Número máximo de candidatos a elegir para este cargo |

#### Tabla `candidatos`

Almacena la información de los candidatos para cada cargo.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único del candidato         |
| `cargo_id`      | UUID         | FK a `cargos.id`, NOT NULL | Cargo al que se postula el candidato      |
| `nombre`        | VARCHAR(255) | NOT NULL              | Nombre del candidato                      |
| `apellido`      | VARCHAR(255) | NOT NULL              | Apellido del candidato                    |
| `descripcion`   | TEXT         | NULLABLE              | Breve descripción o propuesta del candidato |

#### Tabla `votos`

Almacena los votos emitidos. Esta tabla es crítica para la seguridad y confidencialidad.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único del voto              |
| `eleccion_id`   | UUID         | FK a `elecciones.id`, NOT NULL | Elección a la que pertenece el voto       |
| `votante_id`    | UUID         | FK a `usuarios.id`, NOT NULL | Votante que emitió el voto (para unicidad, luego disociado) |
| `voto_cifrado`  | TEXT         | NOT NULL              | Contenido del voto cifrado                |
| `firma_digital` | TEXT         | NOT NULL              | Firma digital del voto                    |
| `timestamp`     | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Fecha y hora de emisión del voto          |
| `hash_bloque`   | VARCHAR(255) | NULLABLE              | Hash del bloque (si se usa blockchain)    |

#### Tabla `votantes_eleccion`

Tabla de unión para gestionar qué usuarios están habilitados para votar en qué elección.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `eleccion_id`   | UUID         | PK, FK a `elecciones.id`, NOT NULL | Elección                                  |
| `votante_id`    | UUID         | PK, FK a `usuarios.id`, NOT NULL | Votante                                   |
| `ha_votado`     | BOOLEAN      | NOT NULL, DEFAULT FALSE | Indica si el votante ya ha emitido su voto en esta elección |

### 4.3. Consideraciones de Seguridad en la Base de Datos

*   **Cifrado de Datos Sensibles:** La columna `voto_cifrado` almacenará el voto en formato cifrado. La clave de cifrado se gestionará de forma segura y separada de la base de datos.
*   **Anonimización:** Una vez que el voto es emitido y se verifica su unicidad, la relación directa entre `votante_id` y `voto_cifrado` se romperá lógicamente o se anonimizará para preservar el secreto del voto. Esto podría implicar mover el `votante_id` a una tabla de auditoría separada o usar técnicas criptográficas que permitan la verificación sin revelar la identidad.
*   **Índices:** Se crearán índices adecuados en las columnas `tenant_id`, `eleccion_id`, `votante_id` y otras columnas frecuentemente consultadas para optimizar el rendimiento de las consultas.
*   **Transacciones:** Todas las operaciones críticas (ej. emisión de voto) se realizarán dentro de transacciones de base de datos para garantizar la atomicidad y la integridad de los datos.




## 5. Diseño de APIs REST

Las APIs RESTful serán el principal medio de comunicación entre el frontend y el backend. Se diseñarán siguiendo los principios REST, utilizando verbos HTTP estándar, URLs intuitivas y códigos de estado HTTP apropiados. Todas las APIs requerirán autenticación mediante JWT y validación de autorización.

### 5.1. Estructura General de las APIs

*   **Prefijo de Versión:** Todas las APIs tendrán un prefijo de versión (ej. `/api/v1/`) para permitir futuras evoluciones sin romper la compatibilidad.
*   **Recursos:** Las URLs representarán recursos (ej. `/api/v1/tenants`, `/api/v1/elecciones`).
*   **Verbos HTTP:** Se utilizarán `GET` para obtener recursos, `POST` para crear, `PUT`/`PATCH` para actualizar y `DELETE` para eliminar.
*   **Formato de Datos:** JSON será el formato estándar para las solicitudes y respuestas.

### 5.2. Ejemplos de Endpoints (Super Administrador)

| Método | URL                       | Descripción                                   | Autenticación/Autorización |
| :----- | :------------------------ | :-------------------------------------------- | :------------------------- |
| `POST` | `/api/v1/tenants`         | Crea un nuevo tenant                          | Super Admin                |
| `GET`  | `/api/v1/tenants`         | Obtiene la lista de todos los tenants         | Super Admin                |
| `GET`  | `/api/v1/tenants/{id}`    | Obtiene los detalles de un tenant específico  | Super Admin                |
| `PUT`  | `/api/v1/tenants/{id}`    | Actualiza la información de un tenant         | Super Admin                |
| `DELETE`| `/api/v1/tenants/{id}`    | Elimina un tenant                             | Super Admin                |

### 5.3. Ejemplos de Endpoints (Administrador de Tenant)

| Método | URL                               | Descripción                                   | Autenticación/Autorización |
| :----- | :-------------------------------- | :-------------------------------------------- | :------------------------- |
| `POST` | `/api/v1/elecciones`              | Crea una nueva elección para el tenant        | Admin Tenant               |
| `GET`  | `/api/v1/elecciones`              | Obtiene la lista de elecciones del tenant     | Admin Tenant               |
| `GET`  | `/api/v1/elecciones/{id}`         | Obtiene los detalles de una elección específica | Admin Tenant               |
| `PUT`  | `/api/v1/elecciones/{id}`         | Actualiza la información de una elección      | Admin Tenant               |
| `DELETE`| `/api/v1/elecciones/{id}`         | Elimina una elección                          | Admin Tenant               |
| `POST` | `/api/v1/elecciones/{id}/candidatos`| Agrega un candidato a una elección            | Admin Tenant               |
| `GET`  | `/api/v1/elecciones/{id}/candidatos`| Obtiene los candidatos de una elección        | Admin Tenant               |
| `POST` | `/api/v1/elecciones/{id}/votantes`| Importa votantes a una elección               | Admin Tenant               |
| `GET`  | `/api/v1/elecciones/{id}/votantes`| Obtiene los votantes de una elección          | Admin Tenant               |
| `GET`  | `/api/v1/elecciones/{id}/resultados`| Obtiene los resultados de una elección (solo si cerrada) | Admin Tenant               |

### 5.4. Ejemplos de Endpoints (Votante)

| Método | URL                               | Descripción                                   | Autenticación/Autorización |
| :----- | :-------------------------------- | :-------------------------------------------- | :------------------------- |
| `GET`  | `/api/v1/votante/elecciones`      | Obtiene las elecciones disponibles para votar | Votante                    |
| `GET`  | `/api/v1/votante/elecciones/{id}` | Obtiene los detalles de una elección para votar | Votante                    |
| `POST` | `/api/v1/votante/elecciones/{id}/votar`| Emite un voto en una elección               | Votante                    |
| `GET`  | `/api/v1/votante/historial`       | Obtiene el historial de votaciones del votante | Votante                    |

### 5.5. Autenticación y Autorización en APIs

*   **Login:** Un endpoint `/api/v1/auth/login` recibirá credenciales y devolverá un JWT de acceso y un JWT de refresco.
*   **Refresh Token:** Un endpoint `/api/v1/auth/refresh` permitirá obtener un nuevo JWT de acceso utilizando el JWT de refresco.
*   **Protección de Endpoints:** Todos los endpoints protegidos requerirán un JWT válido en el encabezado `Authorization: Bearer <token>`. El backend validará la firma del token, su expiración y los permisos asociados al rol del usuario y al `tenant_id` (si aplica).




## 6. Consideraciones de Seguridad en el Diseño Técnico

La seguridad es un pilar fundamental en "Urna Virtual". El diseño técnico incorporará medidas de seguridad en cada capa de la aplicación para proteger la integridad, confidencialidad y disponibilidad de los datos, así como para cumplir con las normativas OWASP.

### 6.1. Seguridad del Backend

*   **Validación de Entradas:** Todas las entradas de usuario serán validadas rigurosamente en el backend para prevenir ataques como inyección SQL, XSS y Command Injection. Se utilizarán librerías de validación de esquemas (ej. Pydantic con FastAPI) para asegurar que los datos recibidos cumplen con el formato y tipo esperados.
*   **Manejo de Errores Seguro:** Las respuestas de error no contendrán información sensible que pueda ser explotada por atacantes (ej. stack traces, detalles de la base de datos). Se utilizarán mensajes de error genéricos y se registrarán los detalles completos en los logs internos.
*   **Protección de Datos Sensibles:**
    *   **Contraseñas:** Las contraseñas de los usuarios se almacenarán como hashes salteados y con funciones de derivación de clave lentas (ej. bcrypt, Argon2) para proteger contra ataques de fuerza bruta y rainbow tables.
    *   **Claves Criptográficas:** Las claves utilizadas para el cifrado de votos y la firma de JWTs se gestionarán de forma segura, preferiblemente utilizando un servicio de gestión de claves (KMS) o variables de entorno protegidas.
*   **Control de Acceso Basado en Roles (RBAC):** Se implementará una lógica de autorización robusta en el backend que verifique los permisos del usuario para cada acción solicitada, basándose en su rol y en el `tenant_id` asociado a su sesión.
*   **Protección contra CSRF:** Se implementarán tokens CSRF para proteger los endpoints que realizan operaciones de cambio de estado (POST, PUT, DELETE) en el frontend, asegurando que las solicitudes provienen de la aplicación legítima.
*   **Rate Limiting:** Se aplicará limitación de tasas (rate limiting) a los endpoints de autenticación y a otros endpoints críticos para prevenir ataques de fuerza bruta y denegación de servicio.

### 6.2. Seguridad del Frontend

*   **Sanitización de Contenido:** Cualquier contenido generado por el usuario que se muestre en la interfaz será sanitizado para prevenir ataques XSS. Se utilizarán librerías de sanitización de HTML y se evitará el uso de `dangerouslySetInnerHTML` en React.js.
*   **Manejo Seguro de JWTs:** Los JWTs de acceso se almacenarán en memoria (o en `localStorage` con precauciones adicionales) y se enviarán en los encabezados `Authorization` de las solicitudes. Los JWTs de refresco se almacenarán en `HttpOnly cookies` para protegerlos contra ataques XSS.
*   **HTTPS:** Todas las comunicaciones entre el frontend y el backend se realizarán exclusivamente a través de HTTPS para proteger la confidencialidad e integridad de los datos en tránsito.
*   **Content Security Policy (CSP):** Se implementará una CSP estricta para mitigar ataques XSS y la inyección de código malicioso, controlando las fuentes de contenido que el navegador puede cargar.

### 6.3. Seguridad de la Base de Datos

*   **Principios de Mínimo Privilegio:** Las credenciales de la base de datos utilizadas por la aplicación tendrán solo los permisos necesarios para realizar sus operaciones, evitando el acceso a datos sensibles o la ejecución de comandos administrativos.
*   **Auditoría de Base de Datos:** Se configurará la base de datos para registrar eventos de seguridad relevantes, como intentos de acceso fallidos, cambios en el esquema o accesos a datos sensibles.
*   **Backups Cifrados:** Las copias de seguridad de la base de datos se realizarán de forma regular y se cifrarán para proteger los datos en caso de acceso no autorizado a los backups.

### 6.4. Cumplimiento OWASP

El diseño y desarrollo de "Urna Virtual" se guiará por las directrices del OWASP Top 10, prestando especial atención a:

*   **A01:2021-Broken Access Control:** Implementación rigurosa de RBAC y validación de permisos en el backend.
*   **A02:2021-Cryptographic Failures:** Uso de algoritmos criptográficos robustos para contraseñas y votos, y gestión segura de claves.
*   **A03:2021-Injection:** Validación de entradas y uso de ORMs/consultas parametrizadas.
*   **A04:2021-Insecure Design:** Diseño de la arquitectura con la seguridad en mente desde el inicio, incluyendo el aislamiento multitenant.
*   **A05:2021-Security Misconfiguration:** Configuración segura de servidores, bases de datos y frameworks.
*   **A06:2021-Vulnerable and Outdated Components:** Mantenimiento de dependencias actualizadas y escaneo de vulnerabilidades.
*   **A07:2021-Identification and Authentication Failures:** Implementación de JWT seguro, MFA y políticas de contraseñas.
*   **A08:2021-Software and Data Integrity Failures:** Verificación de la integridad de los datos y uso de firmas digitales para los votos.
*   **A09:2021-Security Logging and Monitoring Failures:** Implementación de logs de auditoría detallados y monitoreo continuo.
*   **A10:2021-Server-Side Request Forgery (SSRF):** Prevención de SSRF si la aplicación realiza solicitudes a recursos externos.




## 7. Despliegue y Escalabilidad

El diseño de "Urna Virtual" contempla un despliegue robusto y escalable para asegurar la disponibilidad y el rendimiento bajo diferentes cargas de trabajo.

### 7.1. Estrategia de Despliegue

*   **Contenerización con Docker:** Tanto el frontend como el backend serán empaquetados en contenedores Docker. Esto asegura la consistencia del entorno de ejecución entre desarrollo, pruebas y producción, y facilita el despliegue en cualquier plataforma que soporte Docker.
*   **Orquestación de Contenedores (Kubernetes):** Para entornos de producción, se recomienda el uso de Kubernetes. Kubernetes permitirá la orquestación, gestión, escalado automático y auto-recuperación de los contenedores de la aplicación. Esto es crucial para manejar picos de tráfico durante los períodos de votación.
*   **Infraestructura como Código (IaC):** Se utilizarán herramientas de IaC (ej. Terraform, Ansible) para definir y provisionar la infraestructura necesaria (servidores, bases de datos, redes) de manera automatizada y reproducible.

### 7.2. Escalabilidad

*   **Escalabilidad Horizontal del Backend:** El backend de Python (FastAPI) es stateless (sin estado de sesión en el servidor, ya que se usa JWT), lo que permite escalar horizontalmente añadiendo más instancias del servicio según la demanda. Un balanceador de carga distribuirá el tráfico entre las instancias.
*   **Escalabilidad Horizontal del Frontend:** El frontend de React.js es una aplicación estática que puede ser servida desde un CDN (Content Delivery Network), lo que proporciona una alta disponibilidad y baja latencia a los usuarios finales, y escala automáticamente con la demanda.
*   **Escalabilidad de la Base de Datos:** PostgreSQL puede escalarse verticalmente (aumentando los recursos del servidor) y horizontalmente (mediante replicación de lectura para consultas y sharding para grandes volúmenes de datos, si fuera necesario en el futuro).
*   **Manejo de Colas de Mensajes (futuro):** Para operaciones asíncronas o de procesamiento intensivo (ej. generación de informes complejos, procesamiento de grandes volúmenes de votantes), se podría integrar un sistema de colas de mensajes (ej. RabbitMQ, Kafka) para desacoplar los servicios y mejorar la resiliencia y escalabilidad.

### 7.3. Monitoreo y Alertas

*   **Observabilidad:** Se implementarán herramientas de monitoreo (ej. Prometheus, Grafana) para recolectar métricas de rendimiento del sistema (uso de CPU, memoria, latencia de red, errores de aplicación, etc.).
*   **Logging Centralizado:** Todos los logs de la aplicación (frontend, backend, base de datos) se centralizarán en un sistema (ej. ELK Stack, Grafana Loki) para facilitar la depuración, el análisis de seguridad y la auditoría.
*   **Alertas:** Se configurarán alertas automáticas para notificar a los administradores sobre cualquier anomalía o problema crítico en el sistema, permitiendo una respuesta rápida.

## 8. Conclusión

El diseño técnico de "Urna Virtual" se ha concebido para construir una aplicación robusta, segura, escalable y mantenible. La elección de tecnologías modernas y probadas, junto con una arquitectura bien definida y un enfoque en la seguridad desde el diseño, sentará las bases para una plataforma de voto electrónico confiable y eficiente.



## 9. Actualizaciones del Diseño Técnico

### 9.1. Nuevas Tablas de Base de Datos

#### Tabla `listas_partidos`

Almacena información de las listas o partidos políticos.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único de la lista/partido   |
| `tenant_id`     | UUID         | FK a `tenants.id`, NOT NULL | Tenant propietario de la lista            |
| `nombre`        | VARCHAR(255) | NOT NULL              | Nombre de la lista o partido              |
| `descripcion`   | TEXT         | NULLABLE              | Descripción de la lista o partido         |
| `logo_url`      | VARCHAR(500) | NULLABLE              | URL del logotipo de la lista              |
| `color_primario`| VARCHAR(7)   | NULLABLE              | Color primario en formato hexadecimal     |

#### Tabla `candidatos` (Actualizada)

Se añaden nuevas columnas para imágenes y asociación con listas.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único del candidato         |
| `cargo_id`      | UUID         | FK a `cargos.id`, NOT NULL | Cargo al que se postula el candidato      |
| `lista_id`      | UUID         | FK a `listas_partidos.id`, NULLABLE | Lista o partido que representa            |
| `nombre`        | VARCHAR(255) | NOT NULL              | Nombre del candidato                      |
| `apellido`      | VARCHAR(255) | NOT NULL              | Apellido del candidato                    |
| `descripcion`   | TEXT         | NULLABLE              | Breve descripción o propuesta del candidato |
| `foto_url`      | VARCHAR(500) | NULLABLE              | URL de la fotografía del candidato        |
| `numero_orden`  | INTEGER      | NOT NULL              | Número de orden en la boleta              |

#### Tabla `simulacros`

Gestiona los simulacros de votación.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único del simulacro         |
| `eleccion_id`   | UUID         | FK a `elecciones.id`, NOT NULL | Elección asociada al simulacro            |
| `nombre`        | VARCHAR(255) | NOT NULL              | Nombre descriptivo del simulacro          |
| `fecha_creacion`| TIMESTAMP    | NOT NULL, DEFAULT NOW() | Fecha de creación del simulacro           |
| `activo`        | BOOLEAN      | NOT NULL, DEFAULT TRUE | Indica si el simulacro está activo        |

#### Tabla `votos_simulacro`

Almacena los votos emitidos durante simulacros.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único del voto de simulacro |
| `simulacro_id`  | UUID         | FK a `simulacros.id`, NOT NULL | Simulacro al que pertenece el voto        |
| `votante_prueba`| VARCHAR(255) | NOT NULL              | Identificador del votante de prueba       |
| `voto_cifrado`  | TEXT         | NOT NULL              | Contenido del voto cifrado                |
| `timestamp`     | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Fecha y hora de emisión del voto          |

#### Tabla `tenants` (Actualizada)

Se añade información de zona horaria.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `zona_horaria`  | VARCHAR(50)  | NOT NULL, DEFAULT 'UTC' | Zona horaria del tenant (ej. 'America/Mexico_City') |
| `pais`          | VARCHAR(100) | NULLABLE              | País donde está registrado el tenant      |

#### Tabla `metricas_uso`

Almacena métricas de uso para facturación.

| Columna         | Tipo de Dato | Restricciones         | Descripción                               |
| :-------------- | :----------- | :-------------------- | :---------------------------------------- |
| `id`            | UUID         | PK, NOT NULL, UNIQUE  | Identificador único de la métrica         |
| `tenant_id`     | UUID         | FK a `tenants.id`, NOT NULL | Tenant al que pertenece la métrica        |
| `periodo`       | DATE         | NOT NULL              | Período de la métrica (año-mes)           |
| `elecciones_creadas` | INTEGER  | NOT NULL, DEFAULT 0   | Número de elecciones creadas              |
| `elecciones_completadas` | INTEGER | NOT NULL, DEFAULT 0   | Número de elecciones completadas          |
| `votantes_empadronados` | INTEGER | NOT NULL, DEFAULT 0   | Total de votantes empadronados            |
| `votos_emitidos` | INTEGER     | NOT NULL, DEFAULT 0   | Total de votos emitidos                   |
| `almacenamiento_mb` | DECIMAL(10,2) | NOT NULL, DEFAULT 0   | Almacenamiento utilizado en MB            |

### 9.2. Nuevos Endpoints de API

#### APIs para Gestión de Imágenes

| Método | URL                               | Descripción                                   |
| :----- | :-------------------------------- | :-------------------------------------------- |
| `POST` | `/api/v1/candidatos/{id}/foto`    | Sube la fotografía de un candidato            |
| `DELETE`| `/api/v1/candidatos/{id}/foto`    | Elimina la fotografía de un candidato         |
| `POST` | `/api/v1/listas/{id}/logo`        | Sube el logotipo de una lista/partido         |
| `DELETE`| `/api/v1/listas/{id}/logo`        | Elimina el logotipo de una lista/partido      |

#### APIs para Simulacros

| Método | URL                               | Descripción                                   |
| :----- | :-------------------------------- | :-------------------------------------------- |
| `POST` | `/api/v1/elecciones/{id}/simulacros` | Crea un nuevo simulacro para una elección    |
| `GET`  | `/api/v1/elecciones/{id}/simulacros` | Obtiene los simulacros de una elección        |
| `POST` | `/api/v1/simulacros/{id}/votar`   | Emite un voto en un simulacro                 |
| `DELETE`| `/api/v1/simulacros/{id}/limpiar` | Limpia todos los datos de un simulacro        |

#### APIs para Métricas en Tiempo Real

| Método | URL                               | Descripción                                   |
| :----- | :-------------------------------- | :-------------------------------------------- |
| `GET`  | `/api/v1/elecciones/{id}/metricas-tiempo-real` | Obtiene métricas en tiempo real de una elección |
| `GET`  | `/api/v1/elecciones/{id}/participacion` | Obtiene datos de participación en tiempo real |

#### APIs para Reportes de Uso (Super Admin)

| Método | URL                               | Descripción                                   |
| :----- | :-------------------------------- | :-------------------------------------------- |
| `GET`  | `/api/v1/super-admin/reportes-uso` | Obtiene reportes de uso de todos los tenants |
| `GET`  | `/api/v1/super-admin/metricas-facturacion` | Obtiene métricas para facturación            |
| `GET`  | `/api/v1/super-admin/tenants/{id}/uso` | Obtiene el uso específico de un tenant        |

### 9.3. Servicios de Procesamiento en Background

#### Servicio de Gestión de Elecciones Automáticas

*   **Scheduler de Tareas:** Implementación de un sistema de tareas programadas (usando Celery con Redis/RabbitMQ)
*   **Apertura Automática:** Tarea que se ejecuta cada minuto para verificar elecciones que deben abrirse
*   **Cierre Automático:** Tarea que se ejecuta cada minuto para verificar elecciones que deben cerrarse
*   **Notificaciones:** Envío automático de notificaciones a administradores

#### Servicio de Procesamiento de Imágenes

*   **Redimensionamiento:** Automático al subir imágenes
*   **Optimización:** Compresión para web manteniendo calidad
*   **Validación:** Verificación de formato, tamaño y contenido
*   **Almacenamiento:** Gestión segura con CDN para mejor rendimiento

#### Servicio de Métricas y Reportes

*   **Recolección de Métricas:** Proceso continuo de recolección de datos de uso
*   **Agregación de Datos:** Procesamiento periódico para generar reportes
*   **Cálculo de Facturación:** Automatización del cálculo de costos por tenant

### 9.4. Consideraciones de Seguridad Adicionales

#### Gestión de Archivos

*   **Validación de Tipos MIME:** Verificación estricta de tipos de archivo
*   **Escaneo de Malware:** Análisis de archivos subidos antes del almacenamiento
*   **Límites de Tamaño:** Restricciones por tenant y globales
*   **Aislamiento:** Separación física de archivos por tenant

#### Protección de Datos de Facturación

*   **Cifrado de Métricas:** Datos sensibles de uso cifrados en reposo
*   **Auditoría de Acceso:** Registro detallado de acceso a datos de facturación
*   **Retención de Datos:** Políticas claras de retención para datos históricos

