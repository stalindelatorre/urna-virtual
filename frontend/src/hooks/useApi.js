import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService.js';
import electionService from '../services/electionService.js';
import candidateService from '../services/candidateService.js';
import cargoService from '../services/cargoService.js';
import listaService from '../services/listaService.js';
import authService from '../services/authService.js';
import metricsService from '../services/metricsService.js';

// Hook personalizado para gestión de usuarios con backend real
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar usuarios
  const loadUsers = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.getUsers(params);
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear usuario
  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.createUser(userData);
      if (result.success) {
        await loadUsers(); // Recargar lista
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al crear usuario';
      setError(errorMsg);
      console.error('Error creating user:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar usuario
  const updateUser = async (id, userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.updateUser(id, userData);
      if (result.success) {
        await loadUsers(); // Recargar lista
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar usuario';
      setError(errorMsg);
      console.error('Error updating user:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.deleteUser(id);
      if (result.success) {
        await loadUsers(); // Recargar lista
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar usuario';
      setError(errorMsg);
      console.error('Error deleting user:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Activar usuario
  const activateUser = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.activateUser(id);
      if (result.success) {
        await loadUsers(); // Recargar lista
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al activar usuario';
      setError(errorMsg);
      console.error('Error activating user:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Desactivar usuario
  const deactivateUser = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.deactivateUser(id);
      if (result.success) {
        await loadUsers(); // Recargar lista
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al desactivar usuario';
      setError(errorMsg);
      console.error('Error deactivating user:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser
  };
};

// Hook para gestión de elecciones con backend real
export const useElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadElections = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await electionService.getElections(params);
      if (result.success) {
        setElections(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al cargar elecciones');
      console.error('Error loading elections:', err);
    } finally {
      setLoading(false);
    }
  };

  const createElection = async (electionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await electionService.createElection(electionData);
      if (result.success) {
        await loadElections();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al crear elección';
      setError(errorMsg);
      console.error('Error creating election:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateElection = async (id, electionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await electionService.updateElection(id, electionData);
      if (result.success) {
        await loadElections();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar elección';
      setError(errorMsg);
      console.error('Error updating election:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteElection = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await electionService.deleteElection(id);
      if (result.success) {
        await loadElections();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar elección';
      setError(errorMsg);
      console.error('Error deleting election:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const activateElection = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await electionService.activateElection(id);
      if (result.success) {
        await loadElections();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al activar elección';
      setError(errorMsg);
      console.error('Error activating election:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const closeElection = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await electionService.closeElection(id);
      if (result.success) {
        await loadElections();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al cerrar elección';
      setError(errorMsg);
      console.error('Error closing election:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    elections,
    loading,
    error,
    loadElections,
    createElection,
    updateElection,
    deleteElection,
    activateElection,
    closeElection
  };
};

// Hook para gestión de candidatos con backend real
export const useCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCandidates = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await candidateService.getCandidates(params);
      if (result.success) {
        setCandidates(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al cargar candidatos');
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCandidate = async (candidateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await candidateService.createCandidate(candidateData);
      if (result.success) {
        await loadCandidates();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al crear candidato';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateCandidate = async (id, candidateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await candidateService.updateCandidate(id, candidateData);
      if (result.success) {
        await loadCandidates();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar candidato';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidate = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await candidateService.deleteCandidate(id);
      if (result.success) {
        await loadCandidates();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar candidato';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    candidates,
    loading,
    error,
    loadCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate
  };
};

// Hook para gestión de cargos con backend real
export const useCargos = () => {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCargos = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cargoService.getCargos(params);
      if (result.success) {
        setCargos(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al cargar cargos');
      console.error('Error loading cargos:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCargo = async (cargoData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cargoService.createCargo(cargoData);
      if (result.success) {
        await loadCargos();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al crear cargo';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateCargo = async (id, cargoData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cargoService.updateCargo(id, cargoData);
      if (result.success) {
        await loadCargos();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar cargo';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteCargo = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cargoService.deleteCargo(id);
      if (result.success) {
        await loadCargos();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar cargo';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    cargos,
    loading,
    error,
    loadCargos,
    createCargo,
    updateCargo,
    deleteCargo
  };
};

// Hook para gestión de listas/partidos con backend real
export const useListas = () => {
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadListas = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await listaService.getListas(params);
      if (result.success) {
        setListas(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al cargar listas/partidos');
      console.error('Error loading listas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLista = async (listaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await listaService.createLista(listaData);
      if (result.success) {
        await loadListas();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al crear lista/partido';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateLista = async (id, listaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await listaService.updateLista(id, listaData);
      if (result.success) {
        await loadListas();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar lista/partido';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteLista = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await listaService.deleteLista(id);
      if (result.success) {
        await loadListas();
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar lista/partido';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    listas,
    loading,
    error,
    loadListas,
    createLista,
    updateLista,
    deleteLista
  };
};

// Hook para autenticación
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si está autenticado al cargar
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setUser(result.data.user);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al iniciar sesión';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.logout();
      setUser(null);
      return result;
    } catch (err) {
      const errorMsg = 'Error al cerrar sesión';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.updateProfile(profileData);
      if (result.success) {
        setUser(result.data);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar perfil';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated: authService.isAuthenticated(),
    hasRole: authService.hasRole.bind(authService),
    hasPermission: authService.hasPermission.bind(authService)
  };
};

// Hook genérico para manejo de APIs
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeApi = useCallback(async (apiCall, options = {}) => {
    const { showLoading = true, onSuccess, onError } = options;
    
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (showLoading) setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error desconocido';
      setError(errorMessage);
      
      if (onError) {
        onError(err, errorMessage);
      }
      
      if (showLoading) setLoading(false);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    executeApi,
    clearError
  };
};



// Hook para métricas con backend real
export const useMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await metricsService.getDashboardMetrics();
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error al cargar métricas del dashboard");
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await metricsService.getSystemHealth();
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error al cargar salud del sistema");
      console.error("Error loading system health:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadElectionMetrics = async (electionId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await metricsService.getElectionMetrics(electionId);
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error al cargar métricas de elección");
      console.error("Error loading election metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    loading,
    error,
    loadDashboardMetrics,
    loadSystemHealth,
    loadElectionMetrics
  };
};

