import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

class UserService {
  // Obtener todos los usuarios
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.BASE, params);
      return {
        success: true,
        data: response.data || response,
        message: 'Usuarios obtenidos exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }
  
  // Obtener usuario por ID
  async getUserById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Usuario obtenido exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }
  
  // Crear nuevo usuario
  async createUser(userData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de usuario inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, userData);
      return {
        success: true,
        data: response.data || response,
        message: 'Usuario creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }
  
  // Actualizar usuario
  async updateUser(id, userData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateUserData(userData, true); // true para actualización
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de usuario inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), userData);
      return {
        success: true,
        data: response.data || response,
        message: 'Usuario actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }
  
  // Eliminar usuario
  async deleteUser(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }
  
  // Activar usuario
  async activateUser(id) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USERS.ACTIVATE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Usuario activado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }
  
  // Desactivar usuario
  async deactivateUser(id) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USERS.DEACTIVATE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Usuario desactivado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }
  
  // Validar datos de usuario
  validateUserData(userData, isUpdate = false) {
    const errors = {};
    
    // Email es requerido para creación, opcional para actualización
    if (!isUpdate || userData.email) {
      if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
        errors.email = 'Email inválido';
      }
    }
    
    // Nombre es requerido
    if (!userData.nombre || userData.nombre.trim().length < 2) {
      errors.nombre = 'Nombre debe tener al menos 2 caracteres';
    }
    
    // Apellido es requerido
    if (!userData.apellido || userData.apellido.trim().length < 2) {
      errors.apellido = 'Apellido debe tener al menos 2 caracteres';
    }
    
    // Rol es requerido y debe ser válido
    if (!userData.rol || !['SUPER_ADMIN', 'TENANT_ADMIN', 'VOTANTE'].includes(userData.rol)) {
      errors.rol = 'Rol inválido';
    }
    
    // Contraseña es requerida solo para creación
    if (!isUpdate && (!userData.password || userData.password.length < 6)) {
      errors.password = 'Contraseña debe tener al menos 6 caracteres';
    }
    
    // Si se proporciona contraseña en actualización, validarla
    if (isUpdate && userData.password && userData.password.length < 6) {
      errors.password = 'Contraseña debe tener al menos 6 caracteres';
    }
    
    // Validar documento de identidad si se proporciona
    if (userData.documento_identidad && userData.documento_identidad.trim().length < 5) {
      errors.documento_identidad = 'Documento de identidad debe tener al menos 5 caracteres';
    }
    
    // Validar teléfono si se proporciona
    if (userData.telefono && !/^\+?[\d\s\-\(\)]{7,}$/.test(userData.telefono)) {
      errors.telefono = 'Formato de teléfono inválido';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Formatear usuario para mostrar
  formatUserForDisplay(user) {
    return {
      ...user,
      nombreCompleto: `${user.nombre} ${user.apellido}`,
      rolDisplay: this.getRoleDisplayName(user.rol),
      fechaCreacionDisplay: user.fecha_creacion ? 
        new Date(user.fecha_creacion).toLocaleDateString('es-ES') : 'N/A',
      estadoDisplay: user.activo ? 'Activo' : 'Inactivo',
      estadoColor: user.activo ? 'green' : 'red'
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
  
  // Obtener opciones de roles
  getRoleOptions() {
    return [
      { value: 'SUPER_ADMIN', label: 'Super Administrador' },
      { value: 'TENANT_ADMIN', label: 'Administrador' },
      { value: 'VOTANTE', label: 'Votante' }
    ];
  }
  
  // Filtrar usuarios por criterios
  filterUsers(users, filters) {
    if (!users || !Array.isArray(users)) return [];
    
    return users.filter(user => {
      // Filtro por texto (nombre, apellido, email)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          user.nombre.toLowerCase().includes(searchTerm) ||
          user.apellido.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }
      
      // Filtro por rol
      if (filters.rol && filters.rol !== 'all') {
        if (user.rol !== filters.rol) return false;
      }
      
      // Filtro por estado
      if (filters.estado && filters.estado !== 'all') {
        const isActive = filters.estado === 'active';
        if (user.activo !== isActive) return false;
      }
      
      return true;
    });
  }
  
  // Ordenar usuarios
  sortUsers(users, sortBy, sortOrder = 'asc') {
    if (!users || !Array.isArray(users)) return [];
    
    return [...users].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'nombre':
          valueA = `${a.nombre} ${a.apellido}`.toLowerCase();
          valueB = `${b.nombre} ${b.apellido}`.toLowerCase();
          break;
        case 'email':
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;
        case 'rol':
          valueA = a.rol;
          valueB = b.rol;
          break;
        case 'fecha_creacion':
          valueA = new Date(a.fecha_creacion);
          valueB = new Date(b.fecha_creacion);
          break;
        default:
          valueA = a[sortBy];
          valueB = b[sortBy];
      }
      
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

// Crear instancia única del servicio
const userService = new UserService();

export default userService;

