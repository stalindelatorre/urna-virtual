import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

class CandidateService {
  // Obtener todos los candidatos
  async getCandidates(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CANDIDATES.BASE, params);
      return {
        success: true,
        data: response.data || response,
        message: 'Candidatos obtenidos exitosamente'
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
  
  // Obtener candidatos por elección
  async getCandidatesByElection(electionId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CANDIDATES.BY_ELECTION(electionId));
      return {
        success: true,
        data: response.data || response,
        message: 'Candidatos de la elección obtenidos exitosamente'
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
  
  // Obtener candidato por ID
  async getCandidateById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CANDIDATES.BY_ID(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Candidato obtenido exitosamente'
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
  
  // Crear nuevo candidato
  async createCandidate(candidateData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateCandidateData(candidateData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de candidato inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.post(API_ENDPOINTS.CANDIDATES.CREATE, candidateData);
      return {
        success: true,
        data: response.data || response,
        message: 'Candidato creado exitosamente'
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
  
  // Actualizar candidato
  async updateCandidate(id, candidateData) {
    try {
      // Validar datos antes de enviar
      const validation = this.validateCandidateData(candidateData, true); // true para actualización
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos de candidato inválidos',
          errors: validation.errors
        };
      }
      
      const response = await apiClient.put(API_ENDPOINTS.CANDIDATES.UPDATE(id), candidateData);
      return {
        success: true,
        data: response.data || response,
        message: 'Candidato actualizado exitosamente'
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
  
  // Eliminar candidato
  async deleteCandidate(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CANDIDATES.DELETE(id));
      return {
        success: true,
        data: response.data || response,
        message: 'Candidato eliminado exitosamente'
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
  
  // Subir foto de candidato
  async uploadCandidatePhoto(candidateId, photoFile) {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await apiClient.upload(`/candidatos/${candidateId}/photo`, formData);
      return {
        success: true,
        data: response.data || response,
        message: 'Foto subida exitosamente'
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
  
  // Validar datos de candidato
  validateCandidateData(candidateData, isUpdate = false) {
    const errors = {};
    
    // Nombre es requerido
    if (!candidateData.nombre || candidateData.nombre.trim().length < 2) {
      errors.nombre = 'Nombre debe tener al menos 2 caracteres';
    }
    
    // Apellido es requerido
    if (!candidateData.apellido || candidateData.apellido.trim().length < 2) {
      errors.apellido = 'Apellido debe tener al menos 2 caracteres';
    }
    
    // Cargo es requerido para creación
    if (!isUpdate || candidateData.cargo_id) {
      if (!candidateData.cargo_id) {
        errors.cargo_id = 'Cargo es requerido';
      }
    }
    
    // Lista/Partido es requerido para creación
    if (!isUpdate || candidateData.lista_id) {
      if (!candidateData.lista_id) {
        errors.lista_id = 'Lista/Partido es requerido';
      }
    }
    
    // Elección es requerida para creación
    if (!isUpdate || candidateData.eleccion_id) {
      if (!candidateData.eleccion_id) {
        errors.eleccion_id = 'Elección es requerida';
      }
    }
    
    // Validar número de lista si se proporciona
    if (candidateData.numero_lista !== undefined && candidateData.numero_lista !== null) {
      const numero = parseInt(candidateData.numero_lista);
      if (isNaN(numero) || numero < 1) {
        errors.numero_lista = 'Número de lista debe ser un número positivo';
      }
    }
    
    // Validar documento de identidad si se proporciona
    if (candidateData.documento_identidad && candidateData.documento_identidad.trim().length < 5) {
      errors.documento_identidad = 'Documento de identidad debe tener al menos 5 caracteres';
    }
    
    // Validar email si se proporciona
    if (candidateData.email && !/\S+@\S+\.\S+/.test(candidateData.email)) {
      errors.email = 'Email inválido';
    }
    
    // Validar teléfono si se proporciona
    if (candidateData.telefono && !/^\+?[\d\s\-\(\)]{7,}$/.test(candidateData.telefono)) {
      errors.telefono = 'Formato de teléfono inválido';
    }
    
    // Validar fecha de nacimiento si se proporciona
    if (candidateData.fecha_nacimiento) {
      const fechaNacimiento = new Date(candidateData.fecha_nacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      
      if (edad < 18) {
        errors.fecha_nacimiento = 'El candidato debe ser mayor de edad';
      }
      
      if (fechaNacimiento > hoy) {
        errors.fecha_nacimiento = 'Fecha de nacimiento no puede ser futura';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  // Formatear candidato para mostrar
  formatCandidateForDisplay(candidate) {
    return {
      ...candidate,
      nombreCompleto: `${candidate.nombre} ${candidate.apellido}`,
      edadDisplay: candidate.fecha_nacimiento ? 
        this.calculateAge(candidate.fecha_nacimiento) : 'N/A',
      fechaNacimientoDisplay: candidate.fecha_nacimiento ? 
        new Date(candidate.fecha_nacimiento).toLocaleDateString('es-ES') : 'N/A',
      cargoDisplay: candidate.cargo?.nombre || candidate.cargo || 'N/A',
      listaDisplay: candidate.lista?.nombre || candidate.lista || 'N/A',
      eleccionDisplay: candidate.eleccion?.nombre || candidate.eleccion || 'N/A',
      numeroListaDisplay: candidate.numero_lista || 'N/A',
      fotoUrl: candidate.foto_url || this.getDefaultAvatar(candidate.nombre, candidate.apellido)
    };
  }
  
  // Calcular edad
  calculateAge(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }
  
  // Obtener avatar por defecto
  getDefaultAvatar(nombre, apellido) {
    const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`;
  }
  
  // Filtrar candidatos por criterios
  filterCandidates(candidates, filters) {
    if (!candidates || !Array.isArray(candidates)) return [];
    
    return candidates.filter(candidate => {
      // Filtro por texto (nombre, apellido)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          candidate.nombre.toLowerCase().includes(searchTerm) ||
          candidate.apellido.toLowerCase().includes(searchTerm) ||
          (candidate.documento_identidad && candidate.documento_identidad.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }
      
      // Filtro por cargo
      if (filters.cargo_id && filters.cargo_id !== 'all') {
        if (candidate.cargo_id !== parseInt(filters.cargo_id)) return false;
      }
      
      // Filtro por lista/partido
      if (filters.lista_id && filters.lista_id !== 'all') {
        if (candidate.lista_id !== parseInt(filters.lista_id)) return false;
      }
      
      // Filtro por elección
      if (filters.eleccion_id && filters.eleccion_id !== 'all') {
        if (candidate.eleccion_id !== parseInt(filters.eleccion_id)) return false;
      }
      
      return true;
    });
  }
  
  // Ordenar candidatos
  sortCandidates(candidates, sortBy, sortOrder = 'asc') {
    if (!candidates || !Array.isArray(candidates)) return [];
    
    return [...candidates].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'nombre':
          valueA = `${a.nombre} ${a.apellido}`.toLowerCase();
          valueB = `${b.nombre} ${b.apellido}`.toLowerCase();
          break;
        case 'cargo':
          valueA = a.cargo?.nombre || a.cargo || '';
          valueB = b.cargo?.nombre || b.cargo || '';
          break;
        case 'lista':
          valueA = a.lista?.nombre || a.lista || '';
          valueB = b.lista?.nombre || b.lista || '';
          break;
        case 'numero_lista':
          valueA = a.numero_lista || 0;
          valueB = b.numero_lista || 0;
          break;
        case 'fecha_nacimiento':
          valueA = a.fecha_nacimiento ? new Date(a.fecha_nacimiento) : new Date(0);
          valueB = b.fecha_nacimiento ? new Date(b.fecha_nacimiento) : new Date(0);
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
  
  // Agrupar candidatos por cargo
  groupCandidatesByCargo(candidates) {
    if (!candidates || !Array.isArray(candidates)) return {};
    
    return candidates.reduce((groups, candidate) => {
      const cargo = candidate.cargo?.nombre || candidate.cargo || 'Sin cargo';
      if (!groups[cargo]) {
        groups[cargo] = [];
      }
      groups[cargo].push(candidate);
      return groups;
    }, {});
  }
  
  // Agrupar candidatos por lista/partido
  groupCandidatesByLista(candidates) {
    if (!candidates || !Array.isArray(candidates)) return {};
    
    return candidates.reduce((groups, candidate) => {
      const lista = candidate.lista?.nombre || candidate.lista || 'Sin lista';
      if (!groups[lista]) {
        groups[lista] = [];
      }
      groups[lista].push(candidate);
      return groups;
    }, {});
  }
  
  // Validar archivo de foto
  validatePhotoFile(file) {
    const errors = [];
    
    // Verificar que sea un archivo
    if (!file) {
      errors.push('Archivo es requerido');
      return { isValid: false, errors };
    }
    
    // Verificar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Solo se permiten archivos JPG, PNG o WebP');
    }
    
    // Verificar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push('El archivo no debe superar los 5MB');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Generar datos de ejemplo para candidato
  generateSampleCandidate(eleccionId, cargoId, listaId) {
    return {
      nombre: '',
      apellido: '',
      documento_identidad: '',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      biografia: '',
      propuestas: '',
      eleccion_id: eleccionId,
      cargo_id: cargoId,
      lista_id: listaId,
      numero_lista: null,
      foto_url: null
    };
  }
}

// Crear instancia única del servicio
const candidateService = new CandidateService();

export default candidateService;

