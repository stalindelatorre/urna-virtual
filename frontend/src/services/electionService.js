import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

class ElectionService {
  // Obtener todas las elecciones
  async getElections(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ELECTIONS.BASE, params);
      return {
        success: true,
        data: response.data || response,
        message: 'Elecciones obtenidas exitosamente'
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
  
  // Obtener elecciones activas
  async getActiveElections() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ELECTIONS.ACTIVE);
      return {
        success: true,
        data: response.data || response,
        message: 'Elecciones activas obtenidas exitosamente'
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
  
  // Obtener elección por ID
  async getElectionById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ELECTIONS.BY_ID(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Elección obtenida exitosamente'
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
  
  // Crear nueva elección
  async createElection(electionData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateElectionData(electionData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de elección inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.post(API_ENDPOINTS.ELECTIONS.CREATE, electionData);
      return {
        success: true,
        data: response.data || response,
        message: 'Elección creada exitosamente'
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
  
  // Actualizar elección
  async updateElection(id, electionData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateElectionData(electionData, true); // true para actualización
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de elección inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.put(API_ENDPOINTS.ELECTIONS.UPDATE(id), electionData);
      return {
        success: true,
        data: response.data || response,
        message: 'Elección actualizada exitosamente'
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
  
  // Eliminar elección
  async deleteElection(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.ELECTIONS.DELETE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Elección eliminada exitosamente'
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
  
  // Activar elección
  async activateElection(id) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.ELECTIONS.ACTIVATE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Elección activada exitosamente'
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
  
  // Cerrar elección
  async closeElection(id) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.ELECTIONS.CLOSE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Elección cerrada exitosamente'
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
  
  // Validar datos de elección
  validateElectionData(electionData, isUpdate = false) {
    const errors = {};
    
    // Nombre es requerido
    if (!electionData.nombre || electionData.nombre.trim().length < 3) {
      errors.nombre = 'Nombre debe tener al menos 3 caracteres';
    }
    
    // Descripción es requerida
    if (!electionData.descripcion || electionData.descripcion.trim().length < 10) {
      errors.descripcion = 'Descripción debe tener al menos 10 caracteres';
    }
    
    // Fechas son requeridas para creación
    if (!isUpdate || electionData.fecha_inicio) {
      if (!electionData.fecha_inicio) {
        errors.fecha_inicio = 'Fecha de inicio es requerida';
      }
    }
    
    if (!isUpdate || electionData.fecha_fin) {
      if (!electionData.fecha_fin) {
        errors.fecha_fin = 'Fecha de fin es requerida';
      }
    }
    
    // Validar que fecha de fin sea posterior a fecha de inicio
    if (electionData.fecha_inicio && electionData.fecha_fin) {
      const inicio = new Date(electionData.fecha_inicio);
      const fin = new Date(electionData.fecha_fin);
      
      if (inicio >= fin) {
        errors.fecha_fin = 'Fecha de fin debe ser posterior a fecha de inicio';
      }
      
      // Solo validar fechas futuras para nuevas elecciones
      if (!isUpdate && inicio < new Date()) {
        errors.fecha_inicio = 'Fecha de inicio no puede ser en el pasado';
      }
    }
    
    // Validar tipo de elección si se proporciona
    if (electionData.tipo && !['PRESIDENCIAL', 'MUNICIPAL', 'REGIONAL', 'OTRA'].includes(electionData.tipo)) {
      errors.tipo = 'Tipo de elección inválido';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Formatear elección para mostrar
  formatElectionForDisplay(election) {
    return {
      ...election,
      fechaInicioDisplay: election.fecha_inicio ? 
        new Date(election.fecha_inicio).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A',
      fechaFinDisplay: election.fecha_fin ? 
        new Date(election.fecha_fin).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A',
      estadoDisplay: this.getElectionStatusDisplay(election.estado),
      estadoColor: this.getElectionStatusColor(election.estado),
      duracionDias: election.fecha_inicio && election.fecha_fin ? 
        Math.ceil((new Date(election.fecha_fin) - new Date(election.fecha_inicio)) / (1000 * 60 * 60 * 24)) : 0,
      isActive: election.estado === 'ACTIVE',
      canActivate: election.estado === 'DRAFT',
      canClose: election.estado === 'ACTIVE'
    };
  }
  
  // Obtener nombre de estado para mostrar
  getElectionStatusDisplay(status) {
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
  }
  
  // Obtener color de estado
  getElectionStatusColor(status) {
    switch (status) {
      case 'DRAFT':
        return 'gray';
      case 'ACTIVE':
        return 'green';
      case 'CLOSED':
        return 'blue';
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  }
  
  // Obtener opciones de tipo de elección
  getElectionTypeOptions() {
    return [
      { value: 'PRESIDENCIAL', label: 'Presidencial' },
      { value: 'MUNICIPAL', label: 'Municipal' },
      { value: 'REGIONAL', label: 'Regional' },
      { value: 'OTRA', label: 'Otra' }
    ];
  }
  
  // Obtener opciones de estado
  getElectionStatusOptions() {
    return [
      { value: 'DRAFT', label: 'Borrador' },
      { value: 'ACTIVE', label: 'Activa' },
      { value: 'CLOSED', label: 'Cerrada' },
      { value: 'CANCELLED', label: 'Cancelada' }
    ];
  }
  
  // Filtrar elecciones por criterios
  filterElections(elections, filters) {
    if (!elections || !Array.isArray(elections)) return [];
    
    return elections.filter(election => {
      // Filtro por texto (nombre, descripción)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          election.nombre.toLowerCase().includes(searchTerm) ||
          election.descripcion.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }
      
      // Filtro por estado
      if (filters.estado && filters.estado !== 'all') {
        if (election.estado !== filters.estado) return false;
      }
      
      // Filtro por tipo
      if (filters.tipo && filters.tipo !== 'all') {
        if (election.tipo !== filters.tipo) return false;
      }
      
      // Filtro por fecha
      if (filters.fecha_desde) {
        const fechaDesde = new Date(filters.fecha_desde);
        const fechaEleccion = new Date(election.fecha_inicio);
        if (fechaEleccion < fechaDesde) return false;
      }
      
      if (filters.fecha_hasta) {
        const fechaHasta = new Date(filters.fecha_hasta);
        const fechaEleccion = new Date(election.fecha_inicio);
        if (fechaEleccion > fechaHasta) return false;
      }
      
      return true;
    });
  }
  
  // Ordenar elecciones
  sortElections(elections, sortBy, sortOrder = 'asc') {
    if (!elections || !Array.isArray(elections)) return [];
    
    return [...elections].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'nombre':
          valueA = a.nombre.toLowerCase();
          valueB = b.nombre.toLowerCase();
          break;
        case 'fecha_inicio':
          valueA = new Date(a.fecha_inicio);
          valueB = new Date(b.fecha_inicio);
          break;
        case 'fecha_fin':
          valueA = new Date(a.fecha_fin);
          valueB = new Date(b.fecha_fin);
          break;
        case 'estado':
          valueA = a.estado;
          valueB = b.estado;
          break;
        case 'tipo':
          valueA = a.tipo || '';
          valueB = b.tipo || '';
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
  
  // Verificar si una elección está en curso
  isElectionActive(election) {
    if (election.estado !== 'ACTIVE') return false;
    
    const now = new Date();
    const inicio = new Date(election.fecha_inicio);
    const fin = new Date(election.fecha_fin);
    
    return now >= inicio && now <= fin;
  }
  
  // Obtener tiempo restante de una elección
  getTimeRemaining(election) {
    if (election.estado !== 'ACTIVE') return null;
    
    const now = new Date();
    const fin = new Date(election.fecha_fin);
    
    if (now > fin) return { expired: true };
    
    const diff = fin - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      expired: false,
      days,
      hours,
      minutes,
      total: diff
    };
  }
}

// Crear instancia única del servicio
const electionService = new ElectionService();

export default electionService;

