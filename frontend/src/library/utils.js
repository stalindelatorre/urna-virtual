/**
 * Utilidades compartidas para la aplicación SaaS de Voto Electrónico Seguro y Transparente
 * Este archivo contiene funciones de utilidad comunes utilizadas en toda la aplicación
 */

// Función para combinar clases CSS de manera condicional
// Útil para trabajar con Tailwind CSS y componentes dinámicos
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Función para combinar clases CSS con soporte para objetos condicionales
export function classNames(...classes) {
  return classes
    .map(cls => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, condition]) => condition)
          .map(([className]) => className)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

// Validaciones de entrada
export const validators = {
  // Validar formato de email
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar contraseña segura (mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número)
  password: (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Validar ID de votante (formato personalizable)
  voterId: (id) => {
    // Ejemplo: formato alfanumérico de 8-12 caracteres
    const voterIdRegex = /^[A-Za-z0-9]{8,12}$/;
    return voterIdRegex.test(id);
  },

  // Validar que un campo no esté vacío
  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },

  // Validar número de teléfono (formato internacional básico)
  phone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }
};

// Funciones de formateo
export const formatters = {
  // Formatear fecha para mostrar en la UI
  date: (date, locale = 'es-ES') => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Formatear fecha y hora
  datetime: (datetime, locale = 'es-ES') => {
    if (!datetime) return '';
    const dateObj = new Date(datetime);
    return dateObj.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Formatear tiempo restante para votación
  timeRemaining: (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Votación finalizada';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  // Formatear porcentaje
  percentage: (value, decimals = 1) => {
    if (typeof value !== 'number') return '0%';
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // Capitalizar primera letra
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
};

// Utilidades para manejo de datos
export const dataUtils = {
  // Generar ID único simple (para uso en frontend)
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce para optimizar búsquedas y llamadas a API
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle para limitar frecuencia de ejecución
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Ordenar array de objetos por propiedad
  sortBy: (array, property, direction = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  },

  // Filtrar array por múltiples criterios
  filterBy: (array, filters) => {
    return array.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === '' || value === null || value === undefined) return true;
        return item[key]?.toString().toLowerCase().includes(value.toString().toLowerCase());
      });
    });
  },

  // Agrupar array por propiedad
  groupBy: (array, property) => {
    return array.reduce((groups, item) => {
      const key = item[property];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }
};

// Utilidades para seguridad básica en frontend
export const securityUtils = {
  // Sanitizar texto para prevenir XSS básico
  sanitizeText: (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },

  // Generar hash simple para verificación de integridad (no criptográfico)
  simpleHash: (str) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return hash.toString();
  },

  // Verificar si una URL es segura (protocolo HTTPS)
  isSecureUrl: (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
};

// Utilidades para manejo de errores y logging
export const errorUtils = {
  // Crear objeto de error estandarizado
  createError: (message, code = 'UNKNOWN_ERROR', details = {}) => {
    return {
      message,
      code,
      details,
      timestamp: new Date().toISOString()
    };
  },

  // Log de errores en desarrollo (solo consola)
  logError: (error, context = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${context}:`, error);
    }
  },

  // Manejar errores de API de forma consistente
  handleApiError: (error) => {
    if (error.response) {
      // Error de respuesta del servidor
      return {
        message: error.response.data?.message || 'Error del servidor',
        status: error.response.status,
        code: error.response.data?.code || 'SERVER_ERROR'
      };
    } else if (error.request) {
      // Error de red
      return {
        message: 'Error de conexión. Verifique su conexión a internet.',
        status: 0,
        code: 'NETWORK_ERROR'
      };
    } else {
      // Error de configuración
      return {
        message: error.message || 'Error inesperado',
        status: 0,
        code: 'CLIENT_ERROR'
      };
    }
  }
};

// Utilidades para localStorage con manejo de errores
export const storageUtils = {
  // Guardar en localStorage con serialización JSON
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      errorUtils.logError(error, 'localStorage.setItem');
      return false;
    }
  },

  // Obtener de localStorage con deserialización JSON
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      errorUtils.logError(error, 'localStorage.getItem');
      return defaultValue;
    }
  },

  // Remover item de localStorage
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      errorUtils.logError(error, 'localStorage.removeItem');
      return false;
    }
  },

  // Limpiar localStorage completamente
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      errorUtils.logError(error, 'localStorage.clear');
      return false;
    }
  }
};

// Utilidades específicas para votación electrónica
export const votingUtils = {
  // Validar estado de votación
  validateVotingStatus: (election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (now < startDate) return 'pending';
    if (now > endDate) return 'ended';
    return 'active';
  },

  // Calcular estadísticas de votación
  calculateVotingStats: (votes, totalEligibleVoters) => {
    const totalVotes = votes.length;
    const participation = totalEligibleVoters > 0 ? totalVotes / totalEligibleVoters : 0;
    
    const votesByCandidate = dataUtils.groupBy(votes, 'candidateId');
    const results = Object.entries(votesByCandidate).map(([candidateId, candidateVotes]) => ({
      candidateId,
      votes: candidateVotes.length,
      percentage: totalVotes > 0 ? candidateVotes.length / totalVotes : 0
    }));

    return {
      totalVotes,
      participation,
      results: dataUtils.sortBy(results, 'votes', 'desc')
    };
  },

  // Verificar elegibilidad para votar
  checkVotingEligibility: (voter, election) => {
    const errors = [];

    if (!voter.isVerified) {
      errors.push('El votante no está verificado');
    }

    if (voter.hasVoted && voter.hasVoted[election.id]) {
      errors.push('El votante ya ha emitido su voto');
    }

    const votingStatus = votingUtils.validateVotingStatus(election);
    if (votingStatus !== 'active') {
      errors.push('La votación no está activa');
    }

    return {
      eligible: errors.length === 0,
      errors
    };
  }
};

// Exportar todas las utilidades como default
export default {
  cn,
  classNames,
  validators,
  formatters,
  dataUtils,
  securityUtils,
  errorUtils,
  storageUtils,
  votingUtils
};

