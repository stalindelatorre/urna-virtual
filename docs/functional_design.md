# Diseño Funcional de Urna Virtual

## 1. Introducción

Este documento detalla el diseño funcional de "Urna Virtual", una aplicación web SaaS multitenant para la gestión de procesos de elección de autoridades en diversas organizaciones. El objetivo principal es proporcionar una plataforma segura, transparente y confidencial para la votación electrónica, garantizando la integridad del proceso electoral y la privacidad del votante. La aplicación está diseñada para ser escalable y adaptable a las necesidades de diferentes tipos de organizaciones, desde pequeñas asociaciones hasta grandes corporaciones.

## 2. Roles de Usuario

"Urna Virtual" contará con tres roles principales, cada uno con un conjunto específico de permisos y funcionalidades:

### 2.1. Super Administrador

El Super Administrador es el usuario con el nivel más alto de privilegios en el sistema. Su función principal es la gestión de los tenants (organizaciones) que utilizarán la plataforma. Este rol es crucial para la administración global de la aplicación SaaS.

### 2.2. Administrador de Tenant

El Administrador de Tenant es el responsable de gestionar los procesos de elección dentro de su organización (tenant). Este rol tiene control total sobre las elecciones de su respectivo tenant, incluyendo la configuración, los participantes y el seguimiento de los resultados.

### 2.3. Votante

El Votante es el usuario final que participa en los procesos de elección. Su interacción con el sistema está limitada a la emisión de su voto de manera segura, secreta y única.




## 3. Casos de Uso y Flujos de Usuario

### 3.1. Casos de Uso del Super Administrador

El Super Administrador tiene la responsabilidad de gestionar la plataforma a nivel global, asegurando el correcto funcionamiento y la disponibilidad para todos los tenants. Sus casos de uso principales incluyen:

*   **Gestión de Tenants:**
    *   Crear nuevos tenants.
    *   Modificar la información de tenants existentes (nombre, contacto, estado).
    *   Activar/desactivar tenants.
    *   Eliminar tenants (con las debidas precauciones y confirmaciones).
    *   Asignar recursos y límites a cada tenant.
*   **Gestión de Usuarios Globales:**
    *   Crear, modificar y eliminar cuentas de Super Administradores.
    *   Restablecer contraseñas de Super Administradores.
*   **Monitoreo del Sistema:**
    *   Visualizar el estado general del sistema.
    *   Acceder a logs de auditoría para detectar actividades sospechosas.
    *   Generar informes de uso de la plataforma.

### 3.2. Casos de Uso del Administrador de Tenant

El Administrador de Tenant gestiona las elecciones dentro de su organización. Sus casos de uso son fundamentales para la operatividad de la plataforma a nivel de cada cliente:

*   **Gestión de Elecciones:**
    *   Crear nuevas elecciones (definir título, descripción, fechas de inicio y fin, cargos a elegir).
    *   Configurar los parámetros de la elección (tipo de votación, número de candidatos por cargo).
    *   Modificar elecciones existentes (antes de su inicio).
    *   Activar/desactivar elecciones.
    *   Eliminar elecciones (antes de su inicio).
*   **Gestión de Candidatos:**
    *   Registrar candidatos para cada cargo.
    *   Modificar información de candidatos.
    *   Eliminar candidatos.
*   **Gestión de Votantes (dentro del tenant):**
    *   Importar listas de votantes (con validación de formato y datos).
    *   Registrar votantes individualmente.
    *   Modificar información de votantes.
    *   Eliminar votantes.
    *   Generar credenciales de acceso para votantes (si aplica).
*   **Monitoreo de Elecciones:**
    *   Visualizar el progreso de la votación en tiempo real (sin revelar votos individuales).
    *   Generar informes de participación.
    *   Cerrar elecciones.
*   **Resultados de Elecciones:**
    *   Visualizar los resultados finales de las elecciones una vez cerradas.
    *   Generar certificados de resultados.

### 3.3. Casos de Uso del Votante

El Votante es el usuario final y su interacción se centra en el proceso de votación, garantizando la simplicidad y la seguridad:

*   **Autenticación:**
    *   Acceder al sistema utilizando credenciales únicas y seguras.
*   **Visualización de Elecciones:**
    *   Ver las elecciones disponibles para votar.
    *   Acceder a la información de la elección (cargos, candidatos).
*   **Emisión del Voto:**
    *   Seleccionar sus candidatos de forma secreta.
    *   Confirmar su voto.
    *   Recibir una confirmación de voto (sin revelar el contenido del voto).
*   **Historial de Voto:**
    *   Visualizar un registro de las elecciones en las que ha participado (sin revelar el voto emitido).




## 4. Requisitos de Seguridad, Transparencia y Confidencialidad

La seguridad, transparencia y confidencialidad son pilares fundamentales de "Urna Virtual". Estos requisitos se aplicarán en todas las capas de la aplicación, desde el diseño de la base de datos hasta la interfaz de usuario.

### 4.1. Seguridad

*   **Autenticación Robusta:**
    *   Implementación de autenticación multifactor (MFA) para administradores.
    *   Uso de contraseñas seguras y políticas de caducidad.
    *   Manejo de sesiones seguro mediante JWT (JSON Web Tokens) con mecanismos de revocación y refresco.
*   **Autorización Granular:**
    *   Control de acceso basado en roles (RBAC) para asegurar que cada usuario solo pueda realizar las acciones permitidas por su rol.
    *   Validación de permisos en el backend para todas las operaciones críticas.
*   **Protección contra Vulnerabilidades OWASP:**
    *   Prevención de inyección SQL mediante el uso de ORMs o consultas parametrizadas.
    *   Protección contra Cross-Site Scripting (XSS) mediante sanitización de entradas y codificación de salidas.
    *   Protección contra Cross-Site Request Forgery (CSRF) con tokens anti-CSRF.
    *   Manejo seguro de errores para evitar la exposición de información sensible.
    *   Validación de entradas exhaustiva en el lado del servidor.
*   **Cifrado de Datos:**
    *   Cifrado de datos en tránsito (TLS/SSL) para todas las comunicaciones entre el cliente y el servidor.
    *   Cifrado de datos sensibles en reposo (por ejemplo, información de votantes, resultados de elecciones antes de su publicación).
*   **Auditoría y Registro:**
    *   Registro detallado de todas las acciones críticas realizadas por los usuarios (Super Administrador, Administrador de Tenant, Votante).
    *   Registros inmutables para el proceso de votación, permitiendo la verificación posterior sin comprometer la privacidad.

### 4.2. Transparencia

*   **Registro de Auditoría:**
    *   Disponibilidad de logs de auditoría para los administradores de tenant, permitiendo verificar la integridad del proceso electoral (sin revelar votos individuales).
    *   Mecanismos para que los votantes puedan verificar que su voto fue registrado correctamente (sin revelar el contenido del voto).
*   **Proceso de Votación Verificable:**
    *   Diseño del sistema para permitir la auditoría externa del proceso de votación, asegurando que los votos se cuenten de manera precisa y sin manipulaciones.
*   **Informes Detallados:**
    *   Generación de informes de participación y resultados que sean claros, concisos y fácilmente comprensibles.

### 4.3. Confidencialidad

*   **Voto Secreto y Único:**
    *   Implementación de un mecanismo criptográfico que asegure que el voto es anónimo e intransferible.
    *   Separación de la identidad del votante del voto emitido para garantizar el anonimato.
    *   Asegurar que cada votante solo pueda emitir un voto por elección.
*   **Protección de Datos Personales:**
    *   Cumplimiento con las normativas de protección de datos (GDPR, etc.) mediante la minimización de datos, el consentimiento y el derecho al olvido.
    *   Acceso restringido a la información personal de los votantes, incluso para los administradores.
*   **Arquitectura Multitenant Segura:**
    *   Aislamiento lógico de los datos entre tenants para asegurar que la información de una organización no sea accesible por otra.
    *   Mecanismos de seguridad para prevenir ataques de 


colisión de tenants o acceso no autorizado entre ellos.

## 5. Mecanismo de Voto Único, Secreto, Inviolable e Intransferible

El corazón de "Urna Virtual" reside en su capacidad para garantizar un proceso de votación que cumpla con los principios de unicidad, secreto, inviolabilidad e intransferibilidad. Esto se logrará mediante una combinación de técnicas criptográficas y un diseño de flujo de votación cuidadoso.

### 5.1. Unicidad del Voto

Para asegurar que cada votante emita un solo voto por elección, se implementarán los siguientes mecanismos:

*   **Identificación del Votante:** Antes de acceder a la boleta electoral, el votante será autenticado de forma segura. Una vez autenticado, su identidad será marcada como 


 'votado' para esa elección específica. Esto se realizará de manera que no se vincule directamente la identidad del votante con el contenido de su voto.
*   **Control de Sesión:** El sistema gestionará las sesiones de votación de forma estricta, impidiendo que un votante pueda iniciar múltiples sesiones de votación para la misma elección o que pueda votar más de una vez desde la misma sesión.
*   **Tokens de Votación:** Se podría considerar la emisión de tokens de votación únicos y de un solo uso para cada votante por elección. Una vez que el token es utilizado para emitir un voto, se invalida, impidiendo su reutilización.

### 5.2. Secreto del Voto

El secreto del voto es primordial para garantizar la libertad y la privacidad del votante. Se implementarán las siguientes medidas:

*   **Cifrado Homomórfico o Cifrado de Voto:** Se explorará el uso de técnicas criptográficas avanzadas, como el cifrado homomórfico o esquemas de cifrado de voto, que permitan realizar operaciones sobre los votos cifrados sin necesidad de descifrarlos. Esto significa que el recuento de votos puede realizarse sin que nadie, ni siquiera los administradores del sistema, conozca el contenido de los votos individuales.
*   **Separación de Identidad y Voto:** La información de identificación del votante se mantendrá estrictamente separada del voto emitido. Una vez que el votante ha sido autenticado y se ha verificado su elegibilidad para votar, su identidad se disocia del voto antes de que este sea cifrado y almacenado.
*   **Anonimización:** Los votos se anonimizarán antes de ser almacenados y contados, asegurando que no haya un rastro directo que vincule un voto específico a un votante individual.

### 5.3. Inviolabilidad del Voto

La inviolabilidad del voto se refiere a la imposibilidad de alterar, eliminar o falsificar un voto una vez que ha sido emitido y registrado en el sistema. Para ello, se considerarán:

*   **Blockchain o Registros Distribuidos:** Se investigará la viabilidad de utilizar una tecnología de registro distribuido (DLT) o blockchain para registrar los votos. Esto proporcionaría un registro inmutable y transparente de todos los votos emitidos, donde cada voto sería un bloque en la cadena, imposible de modificar sin alterar toda la cadena, lo cual sería detectable.
*   **Firmas Digitales:** Cada voto será firmado digitalmente por el votante (o por el sistema en nombre del votante, con su consentimiento explícito y verificable) y por el sistema, garantizando la autenticidad y la integridad del voto. Esto asegura que el voto no ha sido alterado desde su emisión.
*   **Sellado de Tiempo (Timestamping):** Cada voto registrado tendrá un sello de tiempo criptográfico, lo que proporcionará una prueba irrefutable del momento en que el voto fue emitido y registrado, evitando manipulaciones temporales.

### 5.4. Intransferibilidad del Voto

La intransferibilidad del voto asegura que el derecho a votar no puede ser delegado o transferido a otra persona. Esto se garantiza principalmente a través de:

*   **Autenticación Personalizada:** El proceso de autenticación del votante será riguroso y personal, asegurando que solo la persona autorizada pueda acceder a su derecho al voto.
*   **No Reutilización de Credenciales:** Las credenciales de acceso o los tokens de votación serán de un solo uso o estarán vinculados a la sesión actual del votante, impidiendo que puedan ser compartidos o reutilizados por terceros.
*   **Monitoreo de Actividad Sospechosa:** El sistema monitoreará patrones de acceso y votación inusuales que puedan indicar intentos de transferencia o suplantación de identidad, alertando a los administradores en caso de anomalías.




## 6. Arquitectura Multitenant

La aplicación "Urna Virtual" se diseñará con una arquitectura multitenant, lo que permitirá que múltiples organizaciones (tenants) compartan la misma instancia de la aplicación de forma segura y aislada. Esto optimiza los recursos y facilita la gestión y el mantenimiento del sistema.

### 6.1. Aislamiento de Datos

*   **Separación Lógica de Bases de Datos:** Cada tenant tendrá su propio esquema lógico dentro de la base de datos compartida, o se utilizarán identificadores de tenant en cada tabla para asegurar que los datos de un tenant no sean accesibles por otro. Se priorizará la seguridad y el rendimiento en la elección de la estrategia.
*   **Aislamiento de Archivos:** Si la aplicación maneja archivos (por ejemplo, logotipos de organizaciones, imágenes de candidatos), estos se almacenarán de forma que se garantice el aislamiento entre tenants, utilizando estructuras de directorios o prefijos de nombres de archivo específicos para cada tenant.

### 6.2. Personalización por Tenant

*   **Configuración de Marca (Branding):** Cada tenant podrá personalizar ciertos aspectos visuales de su instancia de "Urna Virtual", como el logotipo de la organización, colores primarios y secundarios, y posiblemente fuentes, para que la aplicación se alinee con su identidad corporativa.
*   **Configuración de Elecciones:** Los administradores de tenant tendrán la flexibilidad de configurar sus propias elecciones, incluyendo tipos de votación, cargos, candidatos y votantes, de acuerdo con las necesidades específicas de su organización.
*   **Roles y Permisos Específicos:** Aunque los roles principales son fijos (Administrador de Tenant, Votante), dentro de cada tenant se podrán definir permisos más granulares para los administradores, si fuera necesario, para adaptarse a estructuras organizativas complejas.

### 6.3. Gestión de Recursos

*   **Asignación de Recursos:** El Super Administrador podrá asignar y monitorear los recursos utilizados por cada tenant (por ejemplo, número máximo de elecciones activas, número de votantes registrados, espacio de almacenamiento), lo que permitirá una gestión eficiente de la infraestructura y la implementación de planes de servicio diferenciados.
*   **Escalabilidad Horizontal:** La arquitectura estará diseñada para permitir la escalabilidad horizontal, lo que significa que se podrán añadir más recursos (servidores, bases de datos) a medida que la demanda de usuarios y tenants crezca, sin afectar el rendimiento de la aplicación.

### 6.4. Seguridad en Entornos Multitenant

*   **Validación de Contexto de Tenant:** Todas las solicitudes al backend serán validadas para asegurar que el usuario que realiza la solicitud pertenece al tenant correcto y que solo puede acceder a los datos y recursos de su propio tenant. Esto se realizará mediante la inclusión del ID del tenant en el JWT o en los encabezados de las solicitudes.
*   **Separación de Credenciales:** Las credenciales de autenticación y autorización se gestionarán de forma independiente para cada tenant, evitando cualquier tipo de fuga de información o acceso cruzado.
*   **Auditoría Específica por Tenant:** Los logs de auditoría incluirán el identificador del tenant, lo que facilitará el seguimiento de actividades y la resolución de problemas específicos de cada organización.




## 7. Tecnologías Clave (Resumen)

Aunque el diseño técnico detallará las tecnologías específicas, a nivel funcional, "Urna Virtual" se construirá sobre una base de tecnologías abiertas y ampliamente adoptadas para garantizar flexibilidad, escalabilidad y una comunidad de soporte robusta.

*   **Frontend:** React.js con TypeScript para una interfaz de usuario dinámica, interactiva y tipada, lo que mejora la mantenibilidad y reduce errores.
*   **Backend:** Python, un lenguaje versátil y potente, ideal para el desarrollo de APIs RESTful y la implementación de lógica de negocio compleja, incluyendo los algoritmos criptográficos necesarios para el voto.
*   **Comunicación:** APIs RESTful para la comunicación entre el frontend y el backend, utilizando JWT para la gestión de sesiones y la autenticación.
*   **Base de Datos:** Se optará por una base de datos relacional (por ejemplo, PostgreSQL) por su robustez, capacidad transaccional y soporte para esquemas complejos, adecuada para la gestión de datos multitenant y la integridad de la información electoral.

## 8. Consideraciones Adicionales

### 8.1. Accesibilidad

La aplicación se diseñará siguiendo las pautas de accesibilidad web (WCAG) para asegurar que sea utilizable por personas con diversas capacidades, garantizando una experiencia inclusiva para todos los votantes.

### 8.2. Rendimiento y Escalabilidad

Desde el diseño inicial, se tendrán en cuenta las consideraciones de rendimiento y escalabilidad para asegurar que "Urna Virtual" pueda manejar un gran volumen de usuarios y elecciones concurrentes sin degradación del servicio. Esto incluirá el uso de cachés, optimización de consultas a la base de datos y una arquitectura que permita la distribución de carga.

### 8.3. Mantenimiento y Actualizaciones

El código se desarrollará siguiendo buenas prácticas de programación, con modularidad y documentación interna, para facilitar el mantenimiento a largo plazo y la implementación de futuras actualizaciones y nuevas funcionalidades.

### 8.4. Cumplimiento Normativo

Se prestará especial atención al cumplimiento de las normativas legales y éticas relacionadas con el voto electrónico y la protección de datos en las jurisdicciones relevantes.



## 9. Nuevas Funcionalidades Agregadas

### 9.1. Simulacro de Votación

La funcionalidad de simulacro permite a los administradores de tenant realizar pruebas completas del proceso electoral antes de la votación real, asegurando que todo funcione correctamente.

#### 9.1.1. Características del Simulacro

*   **Modo de Prueba:** Los administradores pueden activar un "modo simulacro" para cualquier elección configurada.
*   **Datos de Prueba:** El simulacro utiliza los mismos candidatos, cargos y configuraciones de la elección real, pero con un conjunto separado de votantes de prueba.
*   **Proceso Completo:** El simulacro replica exactamente el flujo de votación real, incluyendo autenticación, selección de candidatos y confirmación.
*   **Resultados Separados:** Los votos del simulacro se almacenan por separado y no afectan los resultados reales.
*   **Limpieza de Datos:** Al finalizar el simulacro, los administradores pueden limpiar todos los datos de prueba con un solo click.

#### 9.1.2. Casos de Uso del Simulacro

*   **Validación de Configuración:** Verificar que todos los candidatos, cargos y reglas de votación estén correctamente configurados.
*   **Pruebas de Usabilidad:** Permitir que los votantes se familiaricen con la interfaz antes de la votación real.
*   **Capacitación:** Entrenar a los administradores y personal de apoyo en el uso del sistema.
*   **Verificación Técnica:** Probar la infraestructura bajo condiciones similares a la votación real.

### 9.2. Gestión de Imágenes de Candidatos y Listas

El sistema permitirá la carga y gestión de fotografías de candidatos y logotipos de las listas o partidos políticos que representan.

#### 9.2.1. Funcionalidades de Imágenes

*   **Carga de Fotografías:** Los administradores pueden subir fotos de cada candidato en formatos JPG, PNG o WebP.
*   **Gestión de Listas/Partidos:** Posibilidad de crear y gestionar listas o partidos políticos con sus respectivos logotipos.
*   **Validación de Imágenes:** El sistema validará el tamaño, formato y calidad de las imágenes subidas.
*   **Optimización Automática:** Las imágenes se redimensionarán y optimizarán automáticamente para web.
*   **Almacenamiento Seguro:** Las imágenes se almacenarán de forma segura con aislamiento por tenant.

#### 9.2.2. Especificaciones Técnicas de Imágenes

*   **Formatos Soportados:** JPG, PNG, WebP
*   **Tamaño Máximo:** 5MB por imagen
*   **Dimensiones Recomendadas:** 
    *   Fotos de candidatos: 300x400px (ratio 3:4)
    *   Logotipos de listas: 200x200px (cuadrado)
*   **Compresión:** Automática para optimizar carga web

### 9.3. Indicadores en Tiempo Real (Sin Resultados)

Los administradores de tenant tendrán acceso a métricas en tiempo real del proceso electoral, pero sin revelar resultados hasta el cierre oficial.

#### 9.3.1. Métricas Disponibles en Tiempo Real

*   **Participación General:** Porcentaje de votantes que han ejercido su derecho al voto.
*   **Participación por Segmento:** Desglose por grupos demográficos o secciones (si aplica).
*   **Flujo de Votación:** Gráfico temporal mostrando la velocidad de participación a lo largo del día.
*   **Estado del Sistema:** Indicadores de rendimiento y disponibilidad de la plataforma.
*   **Alertas:** Notificaciones sobre eventos importantes o problemas técnicos.

#### 9.3.2. Restricciones de Seguridad

*   **Sin Resultados Parciales:** Ninguna métrica revelará preferencias de voto o resultados parciales.
*   **Datos Agregados:** Toda la información se presenta de forma agregada y anónima.
*   **Acceso Controlado:** Solo los administradores autorizados pueden acceder a estas métricas.

### 9.4. Apertura y Cierre Automático con Zonas Horarias

El sistema gestionará automáticamente la apertura y cierre de procesos electorales basándose en fechas, horas y zonas horarias específicas de cada tenant.

#### 9.4.1. Gestión de Zonas Horarias

*   **Configuración por Tenant:** Cada tenant puede configurar su zona horaria específica durante el registro.
*   **Soporte Global:** El sistema soportará todas las zonas horarias estándar (UTC offsets).
*   **Horario de Verano:** Manejo automático de cambios de horario de verano/invierno.
*   **Validación de Fechas:** El sistema validará que las fechas de inicio y fin sean lógicas y futuras.

#### 9.4.2. Automatización del Proceso

*   **Apertura Automática:** Las elecciones se abren automáticamente en la fecha y hora programadas.
*   **Cierre Automático:** Las elecciones se cierran automáticamente al finalizar el período establecido.
*   **Notificaciones:** Alertas automáticas a administradores antes de la apertura y cierre.
*   **Estados de Transición:** El sistema maneja automáticamente los cambios de estado (PENDIENTE → ACTIVA → CERRADA).

### 9.5. Reportes de Uso para Super Administradores

Los Super Administradores tendrán acceso a reportes detallados de uso de la plataforma para cada tenant, facilitando la facturación y el análisis de uso.

#### 9.5.1. Métricas de Uso por Tenant

*   **Procesos Electorales:**
    *   Número total de elecciones creadas
    *   Elecciones activas, completadas y canceladas
    *   Duración promedio de los procesos electorales
*   **Participación:**
    *   Total de votantes empadronados
    *   Total de votos emitidos
    *   Porcentaje de participación promedio
*   **Uso de Recursos:**
    *   Almacenamiento utilizado (imágenes, datos)
    *   Ancho de banda consumido
    *   Picos de concurrencia de usuarios

#### 9.5.2. Reportes para Facturación

*   **Modelo de Precios Flexible:** Soporte para diferentes modelos de facturación:
    *   Por número de elecciones
    *   Por número de votantes empadronados
    *   Por número de votos emitidos
    *   Modelo híbrido combinando múltiples factores
*   **Períodos de Facturación:** Reportes mensuales, trimestrales o anuales
*   **Exportación de Datos:** Capacidad de exportar reportes en formatos CSV, PDF y Excel
*   **Histórico de Uso:** Mantenimiento de históricos para análisis de tendencias

#### 9.5.3. Dashboard de Análisis

*   **Vista Consolidada:** Dashboard con métricas agregadas de todos los tenants
*   **Comparativas:** Análisis comparativo entre tenants y períodos
*   **Tendencias:** Gráficos de crecimiento y uso a lo largo del tiempo
*   **Alertas de Facturación:** Notificaciones sobre umbrales de uso o facturación

