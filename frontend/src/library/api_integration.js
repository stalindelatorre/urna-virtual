// Archivo de integración centralizada de APIs
// Este archivo combina todas las APIs existentes y nuevas en un solo punto de acceso

import { 
  authAPI, 
  electionsAPI, 
  candidatesAPI, 
  votesAPI, 
  metricsAPI, 
  reportsAPI 
} from './api.js';

import {
  usersAPI,
  tenantsAPI,
  electionsExtendedAPI,
  cargosAPI,
  listasAPI,
  candidatesExtendedAPI,
  metricsExtendedAPI,
  reportsExtendedAPI
} from './api_extended.js';

// Objeto centralizado que combina todas las APIs
export const apiService = {
  // APIs de autenticación
  auth: authAPI,
  
  // APIs de usuarios
  users: usersAPI,
  
  // APIs de tenants/organizaciones
  tenants: tenantsAPI,
  
  // APIs de elecciones (combinadas)
  elections: {
    ...electionsAPI,
    ...electionsExtendedAPI
  },
  
  // APIs de candidatos (combinadas)
  candidates: {
    ...candidatesAPI,
    ...candidatesExtendedAPI
  },
  
  // APIs de cargos
  cargos: cargosAPI,
  
  // APIs de listas/partidos
  listas: listasAPI,
  
  // APIs de votos
  votes: votesAPI,
  
  // APIs de métricas (combinadas)
  metrics: {
    ...metricsAPI,
    ...metricsExtendedAPI
  },
  
  // APIs de reportes (combinadas)
  reports: {
    ...reportsAPI,
    ...reportsExtendedAPI
  }
};

// Funciones de utilidad para manejo de errores
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 422:
        return data.detail || 'Datos inválidos.';
      case 500:
        return 'Error interno del servidor. Intenta nuevamente.';
      default:
        return data.detail || `Error ${status}: ${data.message || 'Error desconocido'}`;
    }
  } else if (error.request) {
    // Error de red
    return 'Error de conexión. Verifica tu conexión a internet.';
  } else {
    // Error de configuración
    return 'Error en la configuración de la solicitud.';
  }
};

// Hook personalizado para manejo de estados de carga
export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const executeApi = async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };
  
  return { loading, error, executeApi };
};

// Funciones de validación de datos
export const validateUserData = (userData) => {
  const errors = {};
  
  if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
    errors.email = 'Email inválido';
  }
  
  if (!userData.nombre || userData.nombre.trim().length < 2) {
    errors.nombre = 'Nombre debe tener al menos 2 caracteres';
  }
  
  if (!userData.apellido || userData.apellido.trim().length < 2) {
    errors.apellido = 'Apellido debe tener al menos 2 caracteres';
  }
  
  if (!userData.rol || !['SUPER_ADMIN', 'TENANT_ADMIN', 'VOTANTE'].includes(userData.rol)) {
    errors.rol = 'Rol inválido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateElectionData = (electionData) => {
  const errors = {};
  
  if (!electionData.nombre || electionData.nombre.trim().length < 3) {
    errors.nombre = 'Nombre debe tener al menos 3 caracteres';
  }
  
  if (!electionData.descripcion || electionData.descripcion.trim().length < 10) {
    errors.descripcion = 'Descripción debe tener al menos 10 caracteres';
  }
  
  if (!electionData.fecha_inicio) {
    errors.fecha_inicio = 'Fecha de inicio es requerida';
  }
  
  if (!electionData.fecha_fin) {
    errors.fecha_fin = 'Fecha de fin es requerida';
  }
  
  if (electionData.fecha_inicio && electionData.fecha_fin) {
    const inicio = new Date(electionData.fecha_inicio);
    const fin = new Date(electionData.fecha_fin);
    
    if (inicio >= fin) {
      errors.fecha_fin = 'Fecha de fin debe ser posterior a fecha de inicio';
    }
    
    if (inicio < new Date()) {
      errors.fecha_inicio = 'Fecha de inicio no puede ser en el pasado';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCandidateData = (candidateData) => {
  const errors = {};
  
  if (!candidateData.nombre || candidateData.nombre.trim().length < 2) {
    errors.nombre = 'Nombre debe tener al menos 2 caracteres';
  }
  
  if (!candidateData.apellido || candidateData.apellido.trim().length < 2) {
    errors.apellido = 'Apellido debe tener al menos 2 caracteres';
  }
  
  if (!candidateData.cargo_id) {
    errors.cargo_id = 'Cargo es requerido';
  }
  
  if (!candidateData.lista_id) {
    errors.lista_id = 'Lista/Partido es requerido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Funciones de formateo de datos
export const formatUserForDisplay = (user) => {
  return {
    ...user,
    nombreCompleto: `${user.nombre} ${user.apellido}`,
    rolDisplay: getRoleDisplayName(user.rol),
    fechaCreacionDisplay: new Date(user.fecha_creacion).toLocaleDateString('es-ES'),
    estadoDisplay: user.activo ? 'Activo' : 'Inactivo'
  };
};

export const formatElectionForDisplay = (election) => {
  return {
    ...election,
    fechaInicioDisplay: new Date(election.fecha_inicio).toLocaleDateString('es-ES'),
    fechaFinDisplay: new Date(election.fecha_fin).toLocaleDateString('es-ES'),
    estadoDisplay: getElectionStatusDisplay(election.estado),
    duracionDias: Math.ceil((new Date(election.fecha_fin) - new Date(election.fecha_inicio)) / (1000 * 60 * 60 * 24))
  };
};

// Funciones auxiliares
const getRoleDisplayName = (role) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Administrador';
    case 'TENANT_ADMIN':
      return 'Administrador';
    case 'VOTANTE':
      return 'Votante';
    default:
      return role;
  }
};

const getElectionStatusDisplay = (status) => {
  switch (status) {
    case 'DRAFT':
      return 'Borrador';
    case 'ACTIVE':
      return 'Activa';
    case 'CLOSED':
      return 'Cerrada';
    case 'CANCELLED':
      return 'Cancelada';
    default:
      return status;
  }
};

export default apiService;

