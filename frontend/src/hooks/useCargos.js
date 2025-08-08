import { useState, useCallback } from 'react';
import { useApi } from './useApi.js';

// Hook específico para cargos
export const useCargos = () => {
  const { loading, error, executeApi, clearError, api } = useApi();
  const [cargos, setCargos] = useState([]);

  const fetchCargos = useCallback(async (params = {}) => {
    return executeApi(
      () => api.cargos.getAll(params),
      {
        onSuccess: (data) => setCargos(data)
      }
    );
  }, [executeApi, api.cargos]);

  const getCargoById = useCallback(async (cargoId) => {
    return executeApi(() => api.cargos.getById(cargoId));
  }, [executeApi, api.cargos]);

  const createCargo = useCallback(async (cargoData) => {
    return executeApi(
      () => api.cargos.create(cargoData),
      {
        onSuccess: () => fetchCargos()
      }
    );
  }, [executeApi, api.cargos, fetchCargos]);

  const updateCargo = useCallback(async (cargoId, cargoData) => {
    return executeApi(
      () => api.cargos.update(cargoId, cargoData),
      {
        onSuccess: () => fetchCargos()
      }
    );
  }, [executeApi, api.cargos, fetchCargos]);

  const deleteCargo = useCallback(async (cargoId) => {
    return executeApi(
      () => api.cargos.delete(cargoId),
      {
        onSuccess: () => fetchCargos()
      }
    );
  }, [executeApi, api.cargos, fetchCargos]);

  return {
    cargos,
    loading,
    error,
    clearError,
    fetchCargos,
    getCargoById,
    createCargo,
    updateCargo,
    deleteCargo
  };
};

export default useCargos;

