import axios from 'axios';
import { 
  createAxiosConfig, 
  getAuthToken, 
  removeAuthToken, 
  getApiUrl 
} from '../config/api.js';

// Crear instancia de axios
const apiClient = axios.create(createAxiosConfig());

// Interceptor para agregar token de autenticación automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o inválido
      removeAuthToken();
      
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Clase para manejar las peticiones HTTP
class ApiClient {
  // Método GET
  async get(endpoint, params = {}) {
    try {
      const url = getApiUrl(endpoint);
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Método POST
  async post(endpoint, data = {}) {
    try {
      const url = getApiUrl(endpoint);
      const response = await apiClient.post(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Método PUT
  async put(endpoint, data = {}) {
    try {
      const url = getApiUrl(endpoint);
      const response = await apiClient.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Método PATCH
  async patch(endpoint, data = {}) {
    try {
      const url = getApiUrl(endpoint);
      const response = await apiClient.patch(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Método DELETE
  async delete(endpoint) {
    try {
      const url = getApiUrl(endpoint);
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Método para subir archivos
  async upload(endpoint, formData) {
    try {
      const url = getApiUrl(endpoint);
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Método para descargar archivos
  async download(endpoint, filename) {
    try {
      const url = getApiUrl(endpoint);
      const response = await apiClient.get(url, {
        responseType: 'blob'
      });
      
      // Crear enlace de descarga
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // Manejo centralizado de errores
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      
      const errorMessage = this.getErrorMessage(status, data);
      
      return {
        status,
        message: errorMessage,
        data: data,
        type: 'response_error'
      };
    } else if (error.request) {
      // Error de red
      return {
        status: 0,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        data: null,
        type: 'network_error'
      };
    } else {
      // Error de configuración
      return {
        status: 0,
        message: 'Error en la configuración de la solicitud.',
        data: null,
        type: 'config_error'
      };
    }
  }
  
  // Obtener mensaje de error basado en el status
  getErrorMessage(status, data) {
    switch (status) {
      case 400:
        return data.detail || 'Solicitud inválida.';
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 422:
        if (data.detail && Array.isArray(data.detail)) {
          // Errores de validación de FastAPI
          return data.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
        }
        return data.detail || 'Datos inválidos.';
      case 429:
        return 'Demasiadas solicitudes. Intenta nuevamente más tarde.';
      case 500:
        return 'Error interno del servidor. Intenta nuevamente.';
      case 502:
        return 'Servidor no disponible. Intenta nuevamente más tarde.';
      case 503:
        return 'Servicio temporalmente no disponible.';
      default:
        return data.detail || data.message || `Error ${status}: Error desconocido`;
    }
  }
  
  // Método para verificar la salud del servidor
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Crear instancia única del cliente
const apiClientInstance = new ApiClient();

export default apiClientInstance;

