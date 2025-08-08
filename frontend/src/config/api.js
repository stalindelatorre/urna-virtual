// Configuración de la API para conectar con el backend
const API_CONFIG = {
  // URL base del backend
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // Versión de la API
  API_VERSION: 'v1',
  
  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: 30000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Construir URL completa de la API
export const getApiUrl = (endpoint) => {
  const baseUrl = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  
  // Usuarios
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    ACTIVATE: (id) => `/users/${id}/activate`,
    DEACTIVATE: (id) => `/users/${id}/deactivate`
  },
  
  // Tenants
  TENANTS: {
    BASE: '/tenants',
    BY_ID: (id) => `/tenants/${id}`,
    CREATE: '/tenants',
    UPDATE: (id) => `/tenants/${id}`,
    DELETE: (id) => `/tenants/${id}`
  },
  
  // Elecciones
  ELECTIONS: {
    BASE: '/elecciones',
    BY_ID: (id) => `/elecciones/${id}`,
    CREATE: '/elecciones',
    UPDATE: (id) => `/elecciones/${id}`,
    DELETE: (id) => `/elecciones/${id}`,
    ACTIVATE: (id) => `/elecciones/${id}/activate`,
    CLOSE: (id) => `/elecciones/${id}/close`,
    ACTIVE: '/elecciones/active'
  },
  
  // Candidatos
  CANDIDATES: {
    BASE: '/candidatos',
    BY_ID: (id) => `/candidatos/${id}`,
    BY_ELECTION: (electionId) => `/candidatos/eleccion/${electionId}`,
    CREATE: '/candidatos',
    UPDATE: (id) => `/candidatos/${id}`,
    DELETE: (id) => `/candidatos/${id}`
  },
  
  // Cargos
  CARGOS: {
    BASE: '/cargos',
    BY_ID: (id) => `/cargos/${id}`,
    CREATE: '/cargos',
    UPDATE: (id) => `/cargos/${id}`,
    DELETE: (id) => `/cargos/${id}`
  },
  
  // Listas/Partidos
  LISTAS: {
    BASE: '/listas',
    BY_ID: (id) => `/listas/${id}`,
    CREATE: '/listas',
    UPDATE: (id) => `/listas/${id}`,
    DELETE: (id) => `/listas/${id}`
  },
  
  // Votos
  VOTES: {
    BASE: '/votos',
    BY_ID: (id) => `/votos/${id}`,
    BY_USER: (userId) => `/votos/usuario/${userId}`,
    BY_ELECTION: (electionId) => `/votos/eleccion/${electionId}`,
    CAST: '/votos/cast',
    HISTORY: '/votos/history'
  },
  
  // Métricas
  METRICS: {
    BASE: '/metricas',
    DASHBOARD: '/metricas/dashboard',
    ELECTIONS: '/metricas/elections',
    USERS: '/metricas/users',
    VOTES: '/metricas/votes',
    SYSTEM_HEALTH: '/metricas/system-health',
    ELECTION_METRICS: (electionId) => `/metricas/election/${electionId}`,
    USER_ACTIVITY: '/metricas/user-activity',
    VOTING_STATS: '/metricas/voting-stats',
    DEMOGRAPHICS: '/metricas/demographics',
    AUDIT: '/metricas/audit'
  },
  
  // Reportes
  REPORTS: {
    BASE: '/reports',
    ELECTION_RESULTS: (electionId) => `/reports/election/${electionId}/results`,
    USER_ACTIVITY: '/reports/user-activity',
    SYSTEM_AUDIT: '/reports/system-audit',
    TENANT_ACTIVITY: '/reports/tenant-activity',
    EXPORT_PDF: (reportId) => `/reports/${reportId}/pdf`,
    EXPORT_EXCEL: (reportId) => `/reports/${reportId}/excel`
  },
  
  // Simulacros
  SIMULACROS: {
    BASE: '/simulacros',
    BY_ID: (id) => `/simulacros/${id}`,
    CREATE: '/simulacros',
    START: (id) => `/simulacros/${id}/start`,
    STOP: (id) => `/simulacros/${id}/stop`
  }
};

// Configuración de axios
export const createAxiosConfig = (token = null) => {
  const config = {
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS
    }
  };
  
  // Agregar token de autenticación si está disponible
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

// Función para obtener el token del localStorage
export const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.warn('Error al obtener token de autenticación:', error);
    return null;
  }
};

// Función para guardar el token en localStorage
export const setAuthToken = (token) => {
  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.warn('Error al guardar token de autenticación:', error);
  }
};

// Función para eliminar el token del localStorage
export const removeAuthToken = () => {
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.warn('Error al eliminar token de autenticación:', error);
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = getAuthToken();
  return token !== null && token !== undefined && token !== '';
};

export default API_CONFIG;

