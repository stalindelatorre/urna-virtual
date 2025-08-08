import { useState, useCallback } from 'react';
import { useApi } from './useApi.js';

// Hook específico para listas/partidos
export const useListas = () => {
  const { loading, error, executeApi, clearError, api } = useApi();
  const [listas, setListas] = useState([]);

  const fetchListas = useCallback(async (params = {}) => {
    return executeApi(
      () => api.listas.getAll(params),
      {
        onSuccess: (data) => setListas(data)
      }
    );
  }, [executeApi, api.listas]);

  const getListaById = useCallback(async (listaId) => {
    return executeApi(() => api.listas.getById(listaId));
  }, [executeApi, api.listas]);

  const createLista = useCallback(async (listaData) => {
    return executeApi(
      () => api.listas.create(listaData),
      {
        onSuccess: () => fetchListas()
      }
    );
  }, [executeApi, api.listas, fetchListas]);

  const updateLista = useCallback(async (listaId, listaData) => {
    return executeApi(
      () => api.listas.update(listaId, listaData),
      {
        onSuccess: () => fetchListas()
      }
    );
  }, [executeApi, api.listas, fetchListas]);

  const deleteLista = useCallback(async (listaId) => {
    return executeApi(
      () => api.listas.delete(listaId),
      {
        onSuccess: () => fetchListas()
      }
    );
  }, [executeApi, api.listas, fetchListas]);

  const uploadLogo = useCallback(async (listaId, file) => {
    return executeApi(
      () => api.listas.uploadLogo(listaId, file),
      {
        onSuccess: () => fetchListas()
      }
    );
  }, [executeApi, api.listas, fetchListas]);

  const deleteLogo = useCallback(async (listaId) => {
    return executeApi(
      () => api.listas.deleteLogo(listaId),
      {
        onSuccess: () => fetchListas()
      }
    );
  }, [executeApi, api.listas, fetchListas]);

  return {
    listas,
    loading,
    error,
    clearError,
    fetchListas,
    getListaById,
    createLista,
    updateLista,
    deleteLista,
    uploadLogo,
    deleteLogo
  };
};

export default useListas;

