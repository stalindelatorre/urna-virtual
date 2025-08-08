import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Funciones de formateo de fechas
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(dateString).toLocaleDateString('es-ES', defaultOptions);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Funciones de validación
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  // Al menos 8 caracteres, una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Funciones de utilidad para arrays
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Funciones de utilidad para strings
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

// Funciones de utilidad para números
export const formatNumber = (num, options = {}) => {
  if (num === null || num === undefined) return '';
  
  return new Intl.NumberFormat('es-ES', options).format(num);
};

export const formatCurrency = (amount, currency = 'EUR') => {
  return formatNumber(amount, {
    style: 'currency',
    currency: currency
  });
};

export const formatPercentage = (value, decimals = 1) => {
  return formatNumber(value, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Funciones de utilidad para localStorage
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Funciones de utilidad para debounce
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Funciones de utilidad para throttle
export const throttle = (func, limit) => {
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
};

// Funciones de utilidad para colores
export const getStatusColor = (status) => {
  const colors = {
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-red-100 text-red-800',
    'DRAFT': 'bg-yellow-100 text-yellow-800',
    'CLOSED': 'bg-gray-100 text-gray-800',
    'PENDING': 'bg-blue-100 text-blue-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getRoleColor = (role) => {
  const colors = {
    'SUPER_ADMIN': 'bg-purple-100 text-purple-800',
    'TENANT_ADMIN': 'bg-blue-100 text-blue-800',
    'VOTANTE': 'bg-green-100 text-green-800'
  };
  
  return colors[role] || 'bg-gray-100 text-gray-800';
};

// Funciones de utilidad para archivos
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Funciones de utilidad para URLs
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

export default {
  cn,
  formatDate,
  formatDateTime,
  isValidEmail,
  isValidPassword,
  groupBy,
  sortBy,
  capitalize,
  truncate,
  formatNumber,
  formatCurrency,
  formatPercentage,
  storage,
  debounce,
  throttle,
  getStatusColor,
  getRoleColor,
  formatFileSize,
  getFileExtension,
  buildQueryString,
  parseQueryString
};

