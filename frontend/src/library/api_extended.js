import api from './api.js';

// APIs extendidas para gestión completa

// Gestión de usuarios
export const usersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },
  
  getById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  create: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },
  
  update: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  delete: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
  
  activate: async (userId) => {
    const response = await api.post(`/users/${userId}/activate`);
    return response.data;
  },
  
  deactivate: async (userId) => {
    const response = await api.post(`/users/${userId}/deactivate`);
    return response.data;
  }
};

// Gestión de tenants
export const tenantsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/tenants/', { params });
    return response.data;
  },
  
  getById: async (tenantId) => {
    const response = await api.get(`/tenants/${tenantId}`);
    return response.data;
  },
  
  create: async (tenantData) => {
    const response = await api.post('/tenants/', tenantData);
    return response.data;
  },
  
  update: async (tenantId, tenantData) => {
    const response = await api.put(`/tenants/${tenantId}`, tenantData);
    return response.data;
  },
  
  delete: async (tenantId) => {
    const response = await api.delete(`/tenants/${tenantId}`);
    return response.data;
  }
};

// Gestión de elecciones extendida
export const electionsExtendedAPI = {
  create: async (electionData) => {
    const response = await api.post('/elecciones/', electionData);
    return response.data;
  },
  
  update: async (electionId, electionData) => {
    const response = await api.put(`/elecciones/${electionId}`, electionData);
    return response.data;
  },
  
  delete: async (electionId) => {
    const response = await api.delete(`/elecciones/${electionId}`);
    return response.data;
  },
  
  activate: async (electionId) => {
    const response = await api.post(`/elecciones/${electionId}/activate`);
    return response.data;
  },
  
  close: async (electionId) => {
    const response = await api.post(`/elecciones/${electionId}/close`);
    return response.data;
  }
};

// Gestión de cargos
export const cargosAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/cargos/', { params });
    return response.data;
  },
  
  getById: async (cargoId) => {
    const response = await api.get(`/cargos/${cargoId}`);
    return response.data;
  },
  
  create: async (cargoData) => {
    const response = await api.post('/cargos/', cargoData);
    return response.data;
  },
  
  update: async (cargoId, cargoData) => {
    const response = await api.put(`/cargos/${cargoId}`, cargoData);
    return response.data;
  },
  
  delete: async (cargoId) => {
    const response = await api.delete(`/cargos/${cargoId}`);
    return response.data;
  }
};

// Gestión de listas/partidos
export const listasAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/listas/', { params });
    return response.data;
  },
  
  getById: async (listaId) => {
    const response = await api.get(`/listas/${listaId}`);
    return response.data;
  },
  
  create: async (listaData) => {
    const response = await api.post('/listas/', listaData);
    return response.data;
  },
  
  update: async (listaId, listaData) => {
    const response = await api.put(`/listas/${listaId}`, listaData);
    return response.data;
  },
  
  delete: async (listaId) => {
    const response = await api.delete(`/listas/${listaId}`);
    return response.data;
  },
  
  uploadLogo: async (listaId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/listas/${listaId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  deleteLogo: async (listaId) => {
    const response = await api.delete(`/listas/${listaId}/logo`);
    return response.data;
  }
};

// Gestión de candidatos extendida
export const candidatesExtendedAPI = {
  create: async (candidateData) => {
    const response = await api.post('/candidatos/', candidateData);
    return response.data;
  },
  
  update: async (candidateId, candidateData) => {
    const response = await api.put(`/candidatos/${candidateId}`, candidateData);
    return response.data;
  },
  
  delete: async (candidateId) => {
    const response = await api.delete(`/candidatos/${candidateId}`);
    return response.data;
  },
  
  uploadPhoto: async (candidateId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/candidatos/${candidateId}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  deletePhoto: async (candidateId) => {
    const response = await api.delete(`/candidatos/${candidateId}/foto`);
    return response.data;
  }
};

// Métricas extendidas
export const metricsExtendedAPI = {
  getDemographic: async (electionId) => {
    const response = await api.get(`/metricas/eleccion/${electionId}/demograficos`);
    return response.data;
  },
  
  getTenantSummary: async (tenantId) => {
    const response = await api.get(`/metricas/tenant/${tenantId}/resumen`);
    return response.data;
  },
  
  getSystemHealth: async () => {
    const response = await api.get('/metricas/sistema/salud');
    return response.data;
  },
  
  getAudit: async (electionId) => {
    const response = await api.get(`/metricas/eleccion/${electionId}/auditoria`);
    return response.data;
  }
};

// Reportes extendidos
export const reportsExtendedAPI = {
  getTenantActivity: async (tenantId, startDate, endDate) => {
    const response = await api.get(`/reports/tenant/${tenantId}/actividad`, {
      params: { fecha_inicio: startDate, fecha_fin: endDate }
    });
    return response.data;
  },
  
  getCompleteElection: async (electionId, includeResults = false) => {
    const response = await api.get(`/reports/eleccion/${electionId}/completo`, {
      params: { incluir_resultados: includeResults }
    });
    return response.data;
  }
};

export default {
  users: usersAPI,
  tenants: tenantsAPI,
  elections: electionsExtendedAPI,
  cargos: cargosAPI,
  listas: listasAPI,
  candidates: candidatesExtendedAPI,
  metrics: metricsExtendedAPI,
  reports: reportsExtendedAPI
};

