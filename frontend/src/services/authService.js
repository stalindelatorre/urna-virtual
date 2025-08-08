import apiClient from './apiClient.js';
import { API_ENDPOINTS, setAuthToken, removeAuthToken, getAuthToken } from '../config/api.js';

class AuthService {
  // Iniciar sesión
  async login(credentials) {
    try {
      // Validar credenciales
      const validation = this.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Credenciales inválidas',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Guardar token si el login es exitoso
      if (response.access_token) {
        setAuthToken(response.access_token);
        
        // Guardar información del usuario
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
        
        return {
          success: true,
          data: {
            token: response.access_token,
            user: response.user,
            expires_in: response.expires_in
          },
          message: 'Inicio de sesión exitoso'
        };
      }
      
      return {
        success: false,
        data: null,
        message: 'Respuesta de autenticación inválida'
      };
      
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Error al iniciar sesión',
        error: error
      };
    }
  }
  
  // Cerrar sesión
  async logout() {
    try {
      // Intentar cerrar sesión en el servidor
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continuar con el logout local aunque falle el servidor
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar datos locales
      removeAuthToken();
      localStorage.removeItem('user_data');
      localStorage.removeItem('refresh_token');
      
      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    }
  }
  
  // Refrescar token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No hay token de refresco disponible');
      }
      
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken
      });
      
      if (response.access_token) {
        setAuthToken(response.access_token);
        
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        
        return {
          success: true,
          data: {
            token: response.access_token,
            expires_in: response.expires_in
          },
          message: 'Token refrescado exitosamente'
        };
      }
      
      throw new Error('Respuesta de refresco inválida');
      
    } catch (error) {
      // Si falla el refresco, cerrar sesión
      await this.logout();
      
      return {
        success: false,
        data: null,
        message: error.message || 'Error al refrescar token',
        error: error
      };
    }
  }
  
  // Obtener perfil del usuario actual
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      
      // Actualizar datos del usuario en localStorage
      if (response.data || response) {
        const userData = response.data || response;
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        return {
          success: true,
          data: userData,
          message: 'Perfil obtenido exitosamente'
        };
      }
      
      return {
        success: false,
        data: null,
        message: 'No se pudo obtener el perfil'
      };
      
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Error al obtener perfil',
        error: error
      };
    }
  }
  
  // Actualizar perfil del usuario
  async updateProfile(profileData) {
    try {
      const validation = this.validateProfileData(profileData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de perfil inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      
      // Actualizar datos del usuario en localStorage
      if (response.data || response) {
        const userData = response.data || response;
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        return {
          success: true,
          data: userData,
          message: 'Perfil actualizado exitosamente'
        };
      }
      
      return {
        success: false,
        data: null,
        message: 'No se pudo actualizar el perfil'
      };
      
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Error al actualizar perfil',
        error: error
      };
    }
  }
  
  // Cambiar contraseña
  async changePassword(passwordData) {
    try {
      const validation = this.validatePasswordChange(passwordData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de contraseña inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.post('/auth/change-password', passwordData);
      
      return {
        success: true,
        data: response.data || response,
        message: 'Contraseña cambiada exitosamente'
      };
      
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Error al cambiar contraseña',
        error: error
      };
    }
  }
  
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = getAuthToken();
    const userData = this.getCurrentUser();
    
    return !!(token && userData);
  }
  
  // Obtener usuario actual desde localStorage
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Error al obtener datos del usuario:', error);
      return null;
    }
  }
  
  // Verificar si el usuario tiene un rol específico
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.rol === role;
  }
  
  // Verificar si el usuario tiene permisos para una acción
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Definir permisos por rol
    const rolePermissions = {
      'SUPER_ADMIN': [
        'manage_users',
        'manage_tenants',
        'manage_elections',
        'manage_candidates',
        'manage_cargos',
        'manage_listas',
        'view_reports',
        'view_metrics',
        'system_config'
      ],
      'TENANT_ADMIN': [
        'manage_elections',
        'manage_candidates',
        'manage_cargos',
        'manage_listas',
        'view_reports',
        'view_metrics',
        'manage_tenant_users'
      ],
      'VOTANTE': [
        'vote',
        'view_elections',
        'view_candidates',
        'view_profile'
      ]
    };
    
    const userPermissions = rolePermissions[user.rol] || [];
    return userPermissions.includes(permission);
  }
  
  // Validar credenciales de login
  validateLoginCredentials(credentials) {
    const errors = {};
    
    if (!credentials.email || !/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!credentials.password || credentials.password.length < 6) {
      errors.password = 'Contraseña debe tener al menos 6 caracteres';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Validar datos de perfil
  validateProfileData(profileData) {
    const errors = {};
    
    if (!profileData.nombre || profileData.nombre.trim().length < 2) {
      errors.nombre = 'Nombre debe tener al menos 2 caracteres';
    }
    
    if (!profileData.apellido || profileData.apellido.trim().length < 2) {
      errors.apellido = 'Apellido debe tener al menos 2 caracteres';
    }
    
    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (profileData.telefono && !/^\+?[\d\s\-\(\)]{7,}$/.test(profileData.telefono)) {
      errors.telefono = 'Formato de teléfono inválido';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Validar cambio de contraseña
  validatePasswordChange(passwordData) {
    const errors = {};
    
    if (!passwordData.current_password) {
      errors.current_password = 'Contraseña actual es requerida';
    }
    
    if (!passwordData.new_password || passwordData.new_password.length < 6) {
      errors.new_password = 'Nueva contraseña debe tener al menos 6 caracteres';
    }
    
    if (!passwordData.confirm_password) {
      errors.confirm_password = 'Confirmación de contraseña es requerida';
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden';
    }
    
    if (passwordData.current_password === passwordData.new_password) {
      errors.new_password = 'La nueva contraseña debe ser diferente a la actual';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Formatear usuario para mostrar
  formatUserForDisplay(user) {
    if (!user) return null;
    
    return {
      ...user,
      nombreCompleto: `${user.nombre} ${user.apellido}`,
      rolDisplay: this.getRoleDisplayName(user.rol),
      iniciales: `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase(),
      avatarUrl: user.avatar_url || this.getDefaultAvatar(user.nombre, user.apellido)
    };
  }
  
  // Obtener nombre de rol para mostrar
  getRoleDisplayName(role) {
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
  }
  
  // Obtener avatar por defecto
  getDefaultAvatar(nombre, apellido) {
    const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`;
  }
  
  // Verificar si el token está próximo a expirar
  isTokenExpiringSoon() {
    try {
      const token = getAuthToken();
      if (!token) return true;
      
      // Decodificar el token JWT (simple, sin verificación)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      // Considerar que expira pronto si quedan menos de 5 minutos
      return (payload.exp - now) < 300;
    } catch (error) {
      console.warn('Error al verificar expiración del token:', error);
      return true;
    }
  }
  
  // Configurar interceptor para refresco automático de token
  setupTokenRefresh() {
    // Este método sería llamado al inicializar la aplicación
    setInterval(async () => {
      if (this.isAuthenticated() && this.isTokenExpiringSoon()) {
        try {
          await this.refreshToken();
        } catch (error) {
          console.warn('Error en refresco automático de token:', error);
        }
      }
    }, 60000); // Verificar cada minuto
  }
}

// Crear instancia única del servicio
const authService = new AuthService();

export default authService;

