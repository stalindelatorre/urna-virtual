# Diseño de Experiencia de Usuario (UX/UI) - Urna Virtual

## 1. Introducción

Este documento presenta el diseño de experiencia de usuario (UX/UI) para "Urna Virtual", la aplicación web SaaS de voto electrónico. El objetivo es crear una interfaz intuitiva, accesible y segura que facilite la interacción de los usuarios con el sistema, manteniendo la confianza y transparencia en el proceso electoral. El diseño se enfoca en la simplicidad, claridad y eficiencia para cada uno de los tres roles principales: Super Administrador, Administrador de Tenant y Votante.

## 2. Principios de Diseño

### 2.1. Simplicidad y Claridad

La interfaz debe ser intuitiva y fácil de usar, especialmente para los votantes que pueden no tener experiencia técnica avanzada. Cada pantalla debe tener un propósito claro y los elementos de navegación deben ser evidentes.

### 2.2. Confianza y Transparencia

El diseño debe transmitir confianza y profesionalismo, utilizando elementos visuales que refuercen la seguridad y transparencia del proceso electoral. Los colores, tipografía y elementos gráficos deben evocar seriedad y credibilidad.

### 2.3. Accesibilidad

La aplicación debe cumplir con las pautas de accesibilidad web (WCAG 2.1) para asegurar que sea utilizable por personas con diversas capacidades. Esto incluye contraste adecuado, navegación por teclado, compatibilidad con lectores de pantalla y texto alternativo para imágenes.

### 2.4. Responsividad

El diseño debe ser completamente responsivo, adaptándose a diferentes tamaños de pantalla (desktop, tablet, móvil) para garantizar una experiencia óptima en cualquier dispositivo.

## 3. Identidad Visual

### 3.1. Paleta de Colores

La paleta de colores se basa en tonos que transmiten confianza, seguridad y profesionalismo:

*   **Azul Primario (#1E3A8A):** Color principal que evoca confianza, estabilidad y profesionalismo. Se utilizará para elementos principales como botones de acción, encabezados y enlaces importantes.
*   **Azul Secundario (#3B82F6):** Una variante más clara del azul primario para elementos secundarios, hover states y acentos.
*   **Verde de Confirmación (#10B981):** Para indicar acciones exitosas, confirmaciones y estados positivos.
*   **Rojo de Alerta (#EF4444):** Para errores, alertas y acciones destructivas.
*   **Gris Neutro (#6B7280):** Para texto secundario, bordes y elementos de apoyo.
*   **Gris Claro (#F9FAFB):** Para fondos y áreas de contenido secundario.
*   **Blanco (#FFFFFF):** Para fondos principales y texto sobre elementos oscuros.

### 3.2. Tipografía

*   **Fuente Principal:** Inter - Una fuente sans-serif moderna, legible y profesional que funciona bien en pantallas digitales.
*   **Jerarquía Tipográfica:**
    *   H1: 32px, peso 700 (títulos principales)
    *   H2: 24px, peso 600 (subtítulos de sección)
    *   H3: 20px, peso 600 (subtítulos menores)
    *   Cuerpo: 16px, peso 400 (texto general)
    *   Pequeño: 14px, peso 400 (texto secundario)

### 3.3. Iconografía

Se utilizará una biblioteca de iconos consistente (como Heroicons o Feather Icons) para mantener la coherencia visual. Los iconos serán simples, claros y reconocibles, utilizando un estilo de línea uniforme.


## 4. Wireframes y Mockups por Rol

### 4.1. Interfaz del Super Administrador

El Super Administrador necesita una interfaz que le permita gestionar eficientemente todos los tenants del sistema. Su dashboard debe proporcionar una vista general del estado de la plataforma y acceso rápido a las funciones de administración.

#### 4.1.1. Dashboard del Super Administrador

*   **Encabezado:** Logo de Urna Virtual, nombre del usuario, menú de perfil y logout
*   **Navegación lateral:** Menú con opciones principales (Dashboard, Tenants, Usuarios, Monitoreo, Configuración)
*   **Área principal:**
    *   Métricas clave: Total de tenants activos, elecciones en curso, usuarios registrados
    *   Gráficos de uso de la plataforma
    *   Lista de tenants recientes con acciones rápidas
    *   Alertas y notificaciones del sistema

#### 4.1.2. Gestión de Tenants

*   **Lista de Tenants:** Tabla con información básica (nombre, fecha de creación, estado, número de usuarios)
*   **Filtros y búsqueda:** Barra de búsqueda y filtros por estado, fecha de creación
*   **Acciones:** Botones para crear nuevo tenant, editar, activar/desactivar, ver detalles
*   **Modal de creación/edición:** Formulario con campos necesarios para la información del tenant

### 4.2. Interfaz del Administrador de Tenant

El Administrador de Tenant requiere herramientas completas para gestionar las elecciones de su organización, desde la configuración inicial hasta la visualización de resultados.

#### 4.2.1. Dashboard del Administrador de Tenant

*   **Encabezado personalizado:** Logo de Urna Virtual + logo del tenant (si está configurado)
*   **Navegación:** Dashboard, Elecciones, Candidatos, Votantes, Resultados, Configuración
*   **Área principal:**
    *   Resumen de elecciones (activas, programadas, finalizadas)
    *   Estadísticas de participación
    *   Acciones rápidas (crear nueva elección, importar votantes)
    *   Calendario de elecciones

#### 4.2.2. Gestión de Elecciones

*   **Lista de Elecciones:** Cards o tabla con información de cada elección (título, fechas, estado, participación)
*   **Wizard de creación de elección:** Proceso paso a paso para configurar una nueva elección
    *   Paso 1: Información básica (título, descripción, fechas)
    *   Paso 2: Configuración de cargos
    *   Paso 3: Registro de candidatos
    *   Paso 4: Selección de votantes
    *   Paso 5: Revisión y activación

#### 4.2.3. Monitoreo de Elección en Vivo

*   **Panel de control en tiempo real:** Métricas de participación sin revelar votos individuales
*   **Gráficos de participación:** Evolución temporal de la participación
*   **Alertas:** Notificaciones sobre eventos importantes (inicio, fin, problemas técnicos)

### 4.3. Interfaz del Votante

La interfaz del votante debe ser extremadamente simple, clara y accesible, minimizando cualquier barrera para la participación electoral.

#### 4.3.1. Página de Login del Votante

*   **Diseño centrado y minimalista:** Logo de Urna Virtual prominente
*   **Formulario de login:** Campos para email/usuario y contraseña
*   **Información de seguridad:** Breve texto sobre la seguridad del proceso
*   **Soporte:** Enlaces a ayuda o contacto

#### 4.3.2. Dashboard del Votante

*   **Bienvenida personalizada:** Saludo con el nombre del votante
*   **Elecciones disponibles:** Cards con información clara de cada elección disponible para votar
*   **Estado de participación:** Indicadores visuales de elecciones ya votadas vs. pendientes
*   **Historial:** Acceso a elecciones pasadas (sin revelar el voto emitido)

#### 4.3.3. Proceso de Votación

*   **Información de la elección:** Título, descripción, instrucciones claras
*   **Boleta electoral:** Diseño claro con candidatos organizados por cargo
*   **Selección intuitiva:** Radio buttons o checkboxes según el tipo de elección
*   **Revisión del voto:** Pantalla de confirmación antes del envío final
*   **Confirmación:** Mensaje de éxito con número de confirmación (sin revelar el voto)


## 5. Componentes de UI Reutilizables

Para mantener la consistencia y acelerar el desarrollo, se definirán componentes de UI reutilizables que seguirán el sistema de diseño establecido.

### 5.1. Botones

*   **Botón Primario:** Fondo azul (#1E3A8A), texto blanco, bordes redondeados (8px)
*   **Botón Secundario:** Fondo transparente, borde azul, texto azul
*   **Botón de Peligro:** Fondo rojo (#EF4444), texto blanco
*   **Estados:** Normal, hover, activo, deshabilitado

### 5.2. Formularios

*   **Campos de entrada:** Bordes sutiles, focus state azul, validación en tiempo real
*   **Labels:** Tipografía clara, posicionamiento consistente
*   **Mensajes de error:** Color rojo, iconografía de alerta
*   **Mensajes de éxito:** Color verde, iconografía de confirmación

### 5.3. Cards y Contenedores

*   **Cards:** Fondo blanco, sombra sutil, bordes redondeados
*   **Contenedores de datos:** Estructura clara para tablas y listas
*   **Modales:** Overlay oscuro, contenido centrado, animaciones suaves

### 5.4. Navegación

*   **Menú principal:** Sidebar para administradores, navegación horizontal para votantes
*   **Breadcrumbs:** Para navegación contextual en flujos complejos
*   **Tabs:** Para organizar contenido relacionado

## 6. Flujos de Usuario Detallados

### 6.1. Flujo de Votación (Votante)

1. **Login:** Página de autenticación simple y segura
2. **Dashboard:** Vista de elecciones disponibles
3. **Selección de elección:** Click en elección disponible
4. **Información de elección:** Detalles, instrucciones, candidatos
5. **Proceso de votación:** Selección de candidatos por cargo
6. **Revisión:** Confirmación de selecciones antes del envío
7. **Confirmación final:** Último paso antes de enviar el voto
8. **Comprobante:** Confirmación de voto emitido con número de referencia

### 6.2. Flujo de Creación de Elección (Admin Tenant)

1. **Dashboard:** Acceso a gestión de elecciones
2. **Wizard de creación:** Proceso guiado paso a paso
3. **Configuración básica:** Título, descripción, fechas
4. **Definición de cargos:** Creación de posiciones a elegir
5. **Registro de candidatos:** Adición de candidatos por cargo
6. **Selección de votantes:** Importación o selección manual
7. **Revisión y activación:** Verificación final y puesta en marcha

### 6.3. Flujo de Gestión de Tenants (Super Admin)

1. **Dashboard:** Vista general del sistema
2. **Lista de tenants:** Gestión de organizaciones
3. **Creación de tenant:** Formulario de registro de nueva organización
4. **Configuración:** Asignación de recursos y permisos
5. **Monitoreo:** Seguimiento de uso y actividad

## 7. Consideraciones de Accesibilidad

### 7.1. Contraste y Legibilidad

*   Ratio de contraste mínimo 4.5:1 para texto normal
*   Ratio de contraste mínimo 3:1 para texto grande
*   Tipografía clara y legible en todos los tamaños

### 7.2. Navegación por Teclado

*   Todos los elementos interactivos accesibles por teclado
*   Orden de tabulación lógico y predecible
*   Indicadores visuales claros para el foco del teclado

### 7.3. Compatibilidad con Lectores de Pantalla

*   Etiquetas descriptivas para todos los elementos de formulario
*   Texto alternativo para imágenes e iconos
*   Estructura semántica HTML apropiada
*   Roles ARIA cuando sea necesario

### 7.4. Diseño Inclusivo

*   Iconografía acompañada de texto descriptivo
*   Múltiples formas de indicar estados (color + texto + iconos)
*   Tamaños de elementos táctiles adecuados (mínimo 44px)

## 8. Responsividad y Adaptación Móvil

### 8.1. Breakpoints

*   **Móvil:** 320px - 768px
*   **Tablet:** 768px - 1024px
*   **Desktop:** 1024px+

### 8.2. Adaptaciones Móviles

*   **Navegación:** Menú hamburguesa para pantallas pequeñas
*   **Formularios:** Campos de entrada optimizados para touch
*   **Tablas:** Scroll horizontal o diseño de cards apiladas
*   **Botones:** Tamaño mínimo de 44px para facilitar el toque

### 8.3. Optimizaciones Táctiles

*   Áreas de toque generosas
*   Espaciado adecuado entre elementos interactivos
*   Feedback visual inmediato para interacciones táctiles

## 9. Conclusión

El diseño UX/UI de "Urna Virtual" prioriza la usabilidad, accesibilidad y confianza. Cada interfaz está diseñada específicamente para las necesidades de su usuario objetivo, manteniendo la consistencia visual y funcional en toda la aplicación. La implementación de estos diseños asegurará una experiencia de usuario óptima que facilite la participación democrática a través de la tecnología.


## 10. Actualizaciones del Diseño UX/UI

### 10.1. Nuevas Interfaces para Gestión de Imágenes

#### 10.1.1. Carga de Fotografías de Candidatos

*   **Interfaz de Carga:** Área de drag & drop con preview inmediato
*   **Validación Visual:** Indicadores claros de formato y tamaño aceptados
*   **Editor Básico:** Herramientas simples para recortar y ajustar la imagen
*   **Vista Previa:** Cómo se verá la foto en la boleta electoral

#### 10.1.2. Gestión de Listas/Partidos

*   **Formulario de Lista:** Campos para nombre, descripción, color primario
*   **Carga de Logo:** Similar a la carga de fotos de candidatos
*   **Paleta de Colores:** Selector visual para el color primario de la lista
*   **Asociación con Candidatos:** Interface para vincular candidatos con listas

### 10.2. Interfaz de Simulacros

#### 10.2.1. Panel de Control de Simulacros

*   **Lista de Simulacros:** Vista de todos los simulacros creados para una elección
*   **Creación de Simulacro:** Wizard simplificado para configurar un nuevo simulacro
*   **Estado del Simulacro:** Indicadores visuales del estado actual (activo, pausado, completado)
*   **Acciones Rápidas:** Botones para iniciar, pausar, limpiar datos

#### 10.2.2. Interfaz de Votación de Simulacro

*   **Indicador de Simulacro:** Banner prominente indicando que es un simulacro
*   **Proceso Idéntico:** Misma interfaz que la votación real para familiarización
*   **Votantes de Prueba:** Sistema para generar credenciales de prueba rápidamente

### 10.3. Dashboard de Métricas en Tiempo Real

#### 10.3.1. Panel de Monitoreo para Admin Tenant

*   **Métricas Principales:** Cards con participación actual, votantes restantes, tiempo restante
*   **Gráfico de Participación:** Línea temporal mostrando el flujo de votación
*   **Mapa de Calor:** Visualización de participación por segmentos (si aplica)
*   **Alertas en Vivo:** Notificaciones sobre eventos importantes

#### 10.3.2. Indicadores de Estado del Sistema

*   **Semáforo de Estado:** Verde/Amarillo/Rojo para estado general del sistema
*   **Métricas de Rendimiento:** Tiempo de respuesta, disponibilidad
*   **Capacidad:** Indicadores de carga del servidor y base de datos

### 10.4. Configuración de Zona Horaria

#### 10.4.1. Selector de Zona Horaria

*   **Búsqueda Inteligente:** Campo de búsqueda con autocompletado
*   **Agrupación por País:** Organización lógica de zonas horarias
*   **Vista Previa:** Muestra la hora actual en la zona seleccionada
*   **Validación:** Verificación de compatibilidad con fechas de elección

#### 10.4.2. Programación de Elecciones

*   **Calendario Mejorado:** Selector de fecha y hora con zona horaria visible
*   **Conversión Automática:** Muestra equivalencias en UTC y zona local
*   **Validaciones Temporales:** Alertas sobre conflictos de horario

### 10.5. Reportes de Uso para Super Administrador

#### 10.5.1. Dashboard de Análisis Global

*   **Métricas Consolidadas:** Vista general de uso de toda la plataforma
*   **Top Tenants:** Ranking de tenants por diferentes métricas
*   **Tendencias:** Gráficos de crecimiento y proyecciones
*   **Alertas de Facturación:** Notificaciones sobre umbrales de uso

#### 10.5.2. Reportes Detallados por Tenant

*   **Filtros Avanzados:** Por período, tipo de métrica, tenant específico
*   **Visualizaciones:** Gráficos de barras, líneas, torta para diferentes métricas
*   **Exportación:** Botones para descargar en PDF, Excel, CSV
*   **Comparativas:** Herramientas para comparar períodos y tenants

### 10.6. Mejoras en la Boleta Electoral

#### 10.6.1. Diseño Enriquecido

*   **Fotos de Candidatos:** Integración visual de fotografías en la boleta
*   **Logotipos de Listas:** Identificación visual de partidos/listas
*   **Colores de Lista:** Uso sutil de colores primarios para identificación
*   **Información Adicional:** Tooltips con información extendida de candidatos

#### 10.6.2. Accesibilidad Mejorada

*   **Texto Alternativo:** Descripciones de imágenes para lectores de pantalla
*   **Alto Contraste:** Modo alternativo para usuarios con problemas visuales
*   **Navegación por Teclado:** Soporte completo para navegación sin mouse
*   **Tamaños de Fuente:** Opciones para aumentar el tamaño del texto

### 10.7. Notificaciones y Alertas

#### 10.7.1. Sistema de Notificaciones

*   **Notificaciones en Tiempo Real:** WebSockets para actualizaciones instantáneas
*   **Centro de Notificaciones:** Panel centralizado para todas las alertas
*   **Configuración de Alertas:** Personalización de qué notificaciones recibir
*   **Historial:** Registro de todas las notificaciones pasadas

#### 10.7.2. Tipos de Notificaciones

*   **Apertura/Cierre Automático:** Alertas 30 minutos antes de eventos automáticos
*   **Problemas Técnicos:** Notificaciones inmediatas sobre errores del sistema
*   **Umbrales de Participación:** Alertas cuando se alcanzan ciertos porcentajes
*   **Actualizaciones del Sistema:** Información sobre mantenimientos y actualizaciones

### 10.8. Responsive Design Actualizado

#### 10.8.1. Adaptaciones Móviles para Nuevas Funciones

*   **Carga de Imágenes:** Interface táctil optimizada para subir fotos
*   **Métricas en Tiempo Real:** Dashboard adaptado para pantallas pequeñas
*   **Simulacros:** Acceso completo a funciones de simulacro desde móvil
*   **Reportes:** Visualizaciones optimizadas para dispositivos móviles

#### 10.8.2. Optimizaciones de Rendimiento

*   **Carga Progresiva:** Imágenes que se cargan según la necesidad
*   **Compresión Adaptativa:** Calidad de imagen ajustada según el dispositivo
*   **Cache Inteligente:** Almacenamiento local de datos frecuentemente accedidos

