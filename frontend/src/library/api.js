import axios from 'axios';

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
} );

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh de tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const authAPI = {
  login: async ({ email, password }) => {
    //console.log('Logging in with:', { email, password });
    const response = await api.post('/auth/login', {
      email: email,
      password: password
    });
    return response;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Otras funciones de API...
export const electionsAPI = {
  getAll: async () => {
    const response = await api.get('/elections/');
    return response.data;
  },
  getById: async (electionId) => {
    const response = await api.get(`/elections/${electionId}`);
    return response.data;
  }
};

export const candidatesAPI = {
  getAll: async () => {
    const response = await api.get(`/candidates/`);
    return response.data;
  }
};

export const votesAPI = {
  cast: async (voteData) => {
    const response = await api.post("/votos/", voteData);
    return response.data;
  },
  getMyVote: async (electionId) => {
    const response = await api.get(`/votos/mi-voto/${electionId}`);
    return response.data;
  }
};

export const metricsAPI = {
  getRealTime: async (electionId) => {
    const response = await api.get(`/metricas/eleccion/${electionId}/tiempo-real`);
    return response.data;
  }
};

export const reportsAPI = {
  getPlatformUsage: async (startDate, endDate) => {
    const response = await api.get(`/reports/super-admin/uso-plataforma`, {
      params: { fecha_inicio: startDate, fecha_fin: endDate }
    });
    return response.data;
  },
  getGlobalStats: async () => {
    const response = await api.get(`/reports/super-admin/estadisticas-globales`);
    return response.data;
  }
}
export default api;
