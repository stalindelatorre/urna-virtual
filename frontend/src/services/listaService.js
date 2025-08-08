import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

class ListaService {
  // Obtener todas las listas/partidos
  async getListas(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LISTAS.BASE, params);
      return {
        success: true,
        data: response.data || response,
        message: 'Listas/Partidos obtenidos exitosamente'
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
  
  // Obtener lista/partido por ID
  async getListaById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LISTAS.BY_ID(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Lista/Partido obtenido exitosamente'
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
  
  // Crear nueva lista/partido
  async createLista(listaData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateListaData(listaData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de lista/partido inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.post(API_ENDPOINTS.LISTAS.CREATE, listaData);
      return {
        success: true,
        data: response.data || response,
        message: 'Lista/Partido creado exitosamente'
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
  
  // Actualizar lista/partido
  async updateLista(id, listaData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateListaData(listaData, true); // true para actualización
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de lista/partido inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.put(API_ENDPOINTS.LISTAS.UPDATE(id), listaData);
      return {
        success: true,
        data: response.data || response,
        message: 'Lista/Partido actualizado exitosamente'
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
  
  // Eliminar lista/partido
  async deleteLista(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.LISTAS.DELETE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Lista/Partido eliminado exitosamente'
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
  
  // Subir logo de lista/partido
  async uploadListaLogo(listaId, logoFile) {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await apiClient.upload(`/listas/${listaId}/logo`, formData);
      return {
        success: true,
        data: response.data || response,
        message: 'Logo subido exitosamente'
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
  
  // Validar datos de lista/partido
  validateListaData(listaData, isUpdate = false) {
    const errors = {};
    
    // Nombre es requerido
    if (!listaData.nombre || listaData.nombre.trim().length < 2) {
      errors.nombre = 'Nombre debe tener al menos 2 caracteres';
    }
    
    // Siglas son requeridas
    if (!listaData.siglas || listaData.siglas.trim().length < 2) {
      errors.siglas = 'Siglas deben tener al menos 2 caracteres';
    }
    
    // Validar que las siglas no sean muy largas
    if (listaData.siglas && listaData.siglas.trim().length > 10) {
      errors.siglas = 'Siglas no deben superar los 10 caracteres';
    }
    
    // Descripción es opcional pero si se proporciona debe tener contenido
    if (listaData.descripcion && listaData.descripcion.trim().length < 10) {
      errors.descripcion = 'Descripción debe tener al menos 10 caracteres';
    }
    
    // Validar color si se proporciona
    if (listaData.color && !/^#[0-9A-F]{6}$/i.test(listaData.color)) {
      errors.color = 'Color debe ser un código hexadecimal válido (ej: #FF0000)';
    }
    
    // Validar email si se proporciona
    if (listaData.email && !/\S+@\S+\.\S+/.test(listaData.email)) {
      errors.email = 'Email inválido';
    }
    
    // Validar teléfono si se proporciona
    if (listaData.telefono && !/^\+?[\d\s\-\(\)]{7,}$/.test(listaData.telefono)) {
      errors.telefono = 'Formato de teléfono inválido';
    }
    
    // Validar sitio web si se proporciona
    if (listaData.sitio_web && !/^https?:\/\/.+\..+/.test(listaData.sitio_web)) {
      errors.sitio_web = 'URL del sitio web inválida';
    }
    
    // Validar fecha de fundación si se proporciona
    if (listaData.fecha_fundacion) {
      const fechaFundacion = new Date(listaData.fecha_fundacion);
      const hoy = new Date();
      
      if (fechaFundacion > hoy) {
        errors.fecha_fundacion = 'Fecha de fundación no puede ser futura';
      }
      
      // Validar que no sea muy antigua (más de 200 años)
      const hace200Anos = new Date();
      hace200Anos.setFullYear(hace200Anos.getFullYear() - 200);
      
      if (fechaFundacion < hace200Anos) {
        errors.fecha_fundacion = 'Fecha de fundación no puede ser anterior a 200 años';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Formatear lista/partido para mostrar
  formatListaForDisplay(lista) {
    return {
      ...lista,
      nombreCompleto: `${lista.nombre} (${lista.siglas})`,
      fechaFundacionDisplay: lista.fecha_fundacion ? 
        new Date(lista.fecha_fundacion).toLocaleDateString('es-ES') : 'N/A',
      fechaCreacionDisplay: lista.fecha_creacion ? 
        new Date(lista.fecha_creacion).toLocaleDateString('es-ES') : 'N/A',
      colorDisplay: lista.color || '#6B7280',
      logoUrl: lista.logo_url || this.getDefaultLogo(lista.siglas),
      activoDisplay: lista.activo ? 'Activo' : 'Inactivo',
      estadoColor: lista.activo ? 'green' : 'red'
    };
  }
  
  // Obtener logo por defecto
  getDefaultLogo(siglas) {
    const initials = siglas.substring(0, 3).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128&format=svg`;
  }
  
  // Generar colores aleatorios para partidos
  generateRandomColor() {
    const colors = [
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#6366F1', // Indigo
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Filtrar listas/partidos por criterios
  filterListas(listas, filters) {
    if (!listas || !Array.isArray(listas)) return [];
    
    return listas.filter(lista => {
      // Filtro por texto (nombre, siglas, descripción)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          lista.nombre.toLowerCase().includes(searchTerm) ||
          lista.siglas.toLowerCase().includes(searchTerm) ||
          (lista.descripcion && lista.descripcion.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }
      
      // Filtro por estado
      if (filters.activo !== undefined && filters.activo !== 'all') {
        const isActive = filters.activo === 'true' || filters.activo === true;
        if (lista.activo !== isActive) return false;
      }
      
      // Filtro por año de fundación
      if (filters.ano_fundacion) {
        if (!lista.fecha_fundacion) return false;
        const anoFundacion = new Date(lista.fecha_fundacion).getFullYear();
        if (anoFundacion !== parseInt(filters.ano_fundacion)) return false;
      }
      
      return true;
    });
  }
  
  // Ordenar listas/partidos
  sortListas(listas, sortBy, sortOrder = 'asc') {
    if (!listas || !Array.isArray(listas)) return [];
    
    return [...listas].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'nombre':
          valueA = a.nombre.toLowerCase();
          valueB = b.nombre.toLowerCase();
          break;
        case 'siglas':
          valueA = a.siglas.toLowerCase();
          valueB = b.siglas.toLowerCase();
          break;
        case 'fecha_fundacion':
          valueA = a.fecha_fundacion ? new Date(a.fecha_fundacion) : new Date(0);
          valueB = b.fecha_fundacion ? new Date(b.fecha_fundacion) : new Date(0);
          break;
        case 'fecha_creacion':
          valueA = a.fecha_creacion ? new Date(a.fecha_creacion) : new Date(0);
          valueB = b.fecha_creacion ? new Date(b.fecha_creacion) : new Date(0);
          break;
        case 'activo':
          valueA = a.activo ? 1 : 0;
          valueB = b.activo ? 1 : 0;
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
  
  // Validar archivo de logo
  validateLogoFile(file) {
    const errors = [];
    
    // Verificar que sea un archivo
    if (!file) {
      errors.push('Archivo es requerido');
      return { isValid: false, errors };
    }
    
    // Verificar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Solo se permiten archivos JPG, PNG, SVG o WebP');
    }
    
    // Verificar tamaño (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      errors.push('El archivo no debe superar los 2MB');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Obtener listas/partidos más comunes (predefinidos)
  getCommonListas() {
    return [
      {
        nombre: 'Partido Liberal',
        siglas: 'PL',
        descripcion: 'Partido político de tendencia liberal',
        color: '#3B82F6',
        activo: true
      },
      {
        nombre: 'Partido Conservador',
        siglas: 'PC',
        descripcion: 'Partido político de tendencia conservadora',
        color: '#EF4444',
        activo: true
      },
      {
        nombre: 'Partido Social Demócrata',
        siglas: 'PSD',
        descripcion: 'Partido político de tendencia socialdemócrata',
        color: '#10B981',
        activo: true
      },
      {
        nombre: 'Movimiento Ciudadano',
        siglas: 'MC',
        descripcion: 'Movimiento político ciudadano independiente',
        color: '#F59E0B',
        activo: true
      },
      {
        nombre: 'Partido Verde',
        siglas: 'PV',
        descripcion: 'Partido político ecologista',
        color: '#84CC16',
        activo: true
      }
    ];
  }
  
  // Generar datos de ejemplo para lista/partido
  generateSampleLista() {
    return {
      nombre: '',
      siglas: '',
      descripcion: '',
      color: this.generateRandomColor(),
      email: '',
      telefono: '',
      sitio_web: '',
      direccion: '',
      fecha_fundacion: '',
      activo: true
    };
  }
  
  // Validar si una lista/partido puede ser eliminada
  async canDeleteLista(listaId) {
    try {
      // Verificar si hay candidatos asociados a esta lista
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
  
  // Obtener estadísticas de listas/partidos
  getListaStats(listas) {
    if (!listas || !Array.isArray(listas)) {
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        conLogo: 0,
        sinLogo: 0,
        promedioAntiguedad: 0
      };
    }
    
    const stats = {
      total: listas.length,
      activos: 0,
      inactivos: 0,
      conLogo: 0,
      sinLogo: 0,
      promedioAntiguedad: 0
    };
    
    const hoy = new Date();
    let sumaAntiguedad = 0;
    let listasConFecha = 0;
    
    listas.forEach(lista => {
      // Contar activos/inactivos
      if (lista.activo) {
        stats.activos++;
      } else {
        stats.inactivos++;
      }
      
      // Contar con/sin logo
      if (lista.logo_url) {
        stats.conLogo++;
      } else {
        stats.sinLogo++;
      }
      
      // Calcular antigüedad
      if (lista.fecha_fundacion) {
        const fechaFundacion = new Date(lista.fecha_fundacion);
        const antiguedad = hoy.getFullYear() - fechaFundacion.getFullYear();
        sumaAntiguedad += antiguedad;
        listasConFecha++;
      }
    });
    
    // Calcular promedio de antigüedad
    if (listasConFecha > 0) {
      stats.promedioAntiguedad = Math.round((sumaAntiguedad / listasConFecha) * 10) / 10;
    }
    
    return stats;
  }
  
  // Obtener colores disponibles para partidos
  getAvailableColors() {
    return [
      { value: '#EF4444', label: 'Rojo', name: 'red' },
      { value: '#3B82F6', label: 'Azul', name: 'blue' },
      { value: '#10B981', label: 'Verde', name: 'green' },
      { value: '#F59E0B', label: 'Amarillo', name: 'yellow' },
      { value: '#8B5CF6', label: 'Púrpura', name: 'purple' },
      { value: '#EC4899', label: 'Rosa', name: 'pink' },
      { value: '#06B6D4', label: 'Cian', name: 'cyan' },
      { value: '#84CC16', label: 'Lima', name: 'lime' },
      { value: '#F97316', label: 'Naranja', name: 'orange' },
      { value: '#6366F1', label: 'Índigo', name: 'indigo' },
      { value: '#64748B', label: 'Gris', name: 'gray' },
      { value: '#0F172A', label: 'Negro', name: 'black' }
    ];
  }
}

// Crear instancia única del servicio
const listaService = new ListaService();

export default listaService;

