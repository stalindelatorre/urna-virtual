import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

class CargoService {
  // Obtener todos los cargos
  async getCargos(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CARGOS.BASE, params);
      return {
        success: true,
        data: response.data || response,
        message: 'Cargos obtenidos exitosamente'
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
  
  // Obtener cargo por ID
  async getCargoById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CARGOS.BY_ID(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Cargo obtenido exitosamente'
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
  
  // Crear nuevo cargo
  async createCargo(cargoData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateCargoData(cargoData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de cargo inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.post(API_ENDPOINTS.CARGOS.CREATE, cargoData);
      return {
        success: true,
        data: response.data || response,
        message: 'Cargo creado exitosamente'
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
  
  // Actualizar cargo
  async updateCargo(id, cargoData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateCargoData(cargoData, true); // true para actualización
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de cargo inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.put(API_ENDPOINTS.CARGOS.UPDATE(id), cargoData);
      return {
        success: true,
        data: response.data || response,
        message: 'Cargo actualizado exitosamente'
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
  
  // Eliminar cargo
  async deleteCargo(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CARGOS.DELETE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Cargo eliminado exitosamente'
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
  
  // Validar datos de cargo
  validateCargoData(cargoData, isUpdate = false) {
    const errors = {};
    
    // Nombre es requerido
    if (!cargoData.nombre || cargoData.nombre.trim().length < 2) {
      errors.nombre = 'Nombre debe tener al menos 2 caracteres';
    }
    
    // Descripción es requerida
    if (!cargoData.descripcion || cargoData.descripcion.trim().length < 10) {
      errors.descripcion = 'Descripción debe tener al menos 10 caracteres';
    }
    
    // Validar nivel si se proporciona
    if (cargoData.nivel && !['NACIONAL', 'REGIONAL', 'LOCAL'].includes(cargoData.nivel)) {
      errors.nivel = 'Nivel debe ser NACIONAL, REGIONAL o LOCAL';
    }
    
    // Validar orden si se proporciona
    if (cargoData.orden !== undefined && cargoData.orden !== null) {
      const orden = parseInt(cargoData.orden);
      if (isNaN(orden) || orden < 1) {
        errors.orden = 'Orden debe ser un número positivo';
      }
    }
    
    // Validar duración del mandato si se proporciona
    if (cargoData.duracion_mandato !== undefined && cargoData.duracion_mandato !== null) {
      const duracion = parseInt(cargoData.duracion_mandato);
      if (isNaN(duracion) || duracion < 1) {
        errors.duracion_mandato = 'Duración del mandato debe ser un número positivo';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Formatear cargo para mostrar
  formatCargoForDisplay(cargo) {
    return {
      ...cargo,
      nivelDisplay: this.getNivelDisplayName(cargo.nivel),
      nivelColor: this.getNivelColor(cargo.nivel),
      duracionMandatoDisplay: cargo.duracion_mandato ? 
        `${cargo.duracion_mandato} año${cargo.duracion_mandato !== 1 ? 's' : ''}` : 'N/A',
      ordenDisplay: cargo.orden || 'N/A',
      fechaCreacionDisplay: cargo.fecha_creacion ? 
        new Date(cargo.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'
    };
  }
  
  // Obtener nombre de nivel para mostrar
  getNivelDisplayName(nivel) {
    switch (nivel) {
      case 'NACIONAL':
        return 'Nacional';
      case 'REGIONAL':
        return 'Regional';
      case 'LOCAL':
        return 'Local';
      default:
        return nivel || 'N/A';
    }
  }
  
  // Obtener color de nivel
  getNivelColor(nivel) {
    switch (nivel) {
      case 'NACIONAL':
        return 'blue';
      case 'REGIONAL':
        return 'green';
      case 'LOCAL':
        return 'orange';
      default:
        return 'gray';
    }
  }
  
  // Obtener opciones de nivel
  getNivelOptions() {
    return [
      { value: 'NACIONAL', label: 'Nacional' },
      { value: 'REGIONAL', label: 'Regional' },
      { value: 'LOCAL', label: 'Local' }
    ];
  }
  
  // Filtrar cargos por criterios
  filterCargos(cargos, filters) {
    if (!cargos || !Array.isArray(cargos)) return [];
    
    return cargos.filter(cargo => {
      // Filtro por texto (nombre, descripción)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          cargo.nombre.toLowerCase().includes(searchTerm) ||
          cargo.descripcion.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }
      
      // Filtro por nivel
      if (filters.nivel && filters.nivel !== 'all') {
        if (cargo.nivel !== filters.nivel) return false;
      }
      
      return true;
    });
  }
  
  // Ordenar cargos
  sortCargos(cargos, sortBy, sortOrder = 'asc') {
    if (!cargos || !Array.isArray(cargos)) return [];
    
    return [...cargos].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'nombre':
          valueA = a.nombre.toLowerCase();
          valueB = b.nombre.toLowerCase();
          break;
        case 'nivel':
          // Ordenar por jerarquía: NACIONAL > REGIONAL > LOCAL
          const nivelOrder = { 'NACIONAL': 3, 'REGIONAL': 2, 'LOCAL': 1 };
          valueA = nivelOrder[a.nivel] || 0;
          valueB = nivelOrder[b.nivel] || 0;
          break;
        case 'orden':
          valueA = a.orden || 0;
          valueB = b.orden || 0;
          break;
        case 'duracion_mandato':
          valueA = a.duracion_mandato || 0;
          valueB = b.duracion_mandato || 0;
          break;
        case 'fecha_creacion':
          valueA = a.fecha_creacion ? new Date(a.fecha_creacion) : new Date(0);
          valueB = b.fecha_creacion ? new Date(b.fecha_creacion) : new Date(0);
          break;
        default:
          valueA = a[sortBy] || '';
          valueB = b[sortBy] || '';
      }
      
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  // Agrupar cargos por nivel
  groupCargosByNivel(cargos) {
    if (!cargos || !Array.isArray(cargos)) return {};
    
    return cargos.reduce((groups, cargo) => {
      const nivel = cargo.nivel || 'Sin nivel';
      if (!groups[nivel]) {
        groups[nivel] = [];
      }
      groups[nivel].push(cargo);
      return groups;
    }, {});
  }
  
  // Obtener cargos más comunes (predefinidos)
  getCommonCargos() {
    return [
      {
        nombre: 'Presidente',
        descripcion: 'Presidente de la República',
        nivel: 'NACIONAL',
        duracion_mandato: 4,
        orden: 1
      },
      {
        nombre: 'Vicepresidente',
        descripcion: 'Vicepresidente de la República',
        nivel: 'NACIONAL',
        duracion_mandato: 4,
        orden: 2
      },
      {
        nombre: 'Senador',
        descripcion: 'Senador de la República',
        nivel: 'NACIONAL',
        duracion_mandato: 4,
        orden: 3
      },
      {
        nombre: 'Diputado',
        descripcion: 'Diputado a la Cámara de Representantes',
        nivel: 'NACIONAL',
        duracion_mandato: 4,
        orden: 4
      },
      {
        nombre: 'Gobernador',
        descripcion: 'Gobernador del Departamento/Estado',
        nivel: 'REGIONAL',
        duracion_mandato: 4,
        orden: 1
      },
      {
        nombre: 'Diputado Departamental',
        descripcion: 'Diputado a la Asamblea Departamental',
        nivel: 'REGIONAL',
        duracion_mandato: 4,
        orden: 2
      },
      {
        nombre: 'Alcalde',
        descripcion: 'Alcalde Municipal',
        nivel: 'LOCAL',
        duracion_mandato: 4,
        orden: 1
      },
      {
        nombre: 'Concejal',
        descripcion: 'Concejal Municipal',
        nivel: 'LOCAL',
        duracion_mandato: 4,
        orden: 2
      }
    ];
  }
  
  // Generar datos de ejemplo para cargo
  generateSampleCargo() {
    return {
      nombre: '',
      descripcion: '',
      nivel: 'LOCAL',
      duracion_mandato: 4,
      orden: 1,
      activo: true
    };
  }
  
  // Validar si un cargo puede ser eliminado
  async canDeleteCargo(cargoId) {
    try {
      // Verificar si hay candidatos asociados a este cargo
      // Esta funcionalidad dependería de tener acceso al servicio de candidatos
      // Por ahora retornamos true, pero en una implementación real
      // se debería verificar las dependencias
      return {
        canDelete: true,
        reason: null
      };
    } catch (error) {
      return {
        canDelete: false,
        reason: 'Error al verificar dependencias'
      };
    }
  }
  
  // Obtener estadísticas de cargos
  getCargoStats(cargos) {
    if (!cargos || !Array.isArray(cargos)) {
      return {
        total: 0,
        porNivel: {},
        promedioMandato: 0
      };
    }
    
    const stats = {
      total: cargos.length,
      porNivel: {},
      promedioMandato: 0
    };
    
    // Contar por nivel
    cargos.forEach(cargo => {
      const nivel = cargo.nivel || 'Sin nivel';
      stats.porNivel[nivel] = (stats.porNivel[nivel] || 0) + 1;
    });
    
    // Calcular promedio de duración de mandato
    const cargosConMandato = cargos.filter(cargo => cargo.duracion_mandato);
    if (cargosConMandato.length > 0) {
      const sumaMandatos = cargosConMandato.reduce((sum, cargo) => sum + cargo.duracion_mandato, 0);
      stats.promedioMandato = Math.round((sumaMandatos / cargosConMandato.length) * 10) / 10;
    }
    
    return stats;
  }
}

// Crear instancia única del servicio
const cargoService = new CargoService();

export default cargoService;

