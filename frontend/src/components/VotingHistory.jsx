import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const VotingHistory = () => {
  const { user } = useAuth();
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de prueba para historial de votos
  const mockVotingHistory = [
    {
      id: 1,
      eleccion: {
        nombre: 'Elección Presidencial 2023',
        fecha: '2023-11-15T10:30:00',
        tipo: 'Presidencial'
      },
      candidato: {
        nombre: 'Juan Carlos Pérez',
        cargo: 'Presidente',
        lista: 'Partido Democrático'
      },
      fecha_voto: '2023-11-15T10:30:00',
      estado: 'CONFIRMADO'
    },
    {
      id: 2,
      eleccion: {
        nombre: 'Elección Municipal 2023',
        fecha: '2023-10-20T14:15:00',
        tipo: 'Municipal'
      },
      candidato: {
        nombre: 'María Elena Rodríguez',
        cargo: 'Alcalde',
        lista: 'Movimiento Ciudadano'
      },
      fecha_voto: '2023-10-20T14:15:00',
      estado: 'CONFIRMADO'
    },
    {
      id: 3,
      eleccion: {
        nombre: 'Elección Regional 2023',
        fecha: '2023-09-10T16:45:00',
        tipo: 'Regional'
      },
      candidato: {
        nombre: 'Carlos Alberto López',
        cargo: 'Gobernador',
        lista: 'Alianza Regional'
      },
      fecha_voto: '2023-09-10T16:45:00',
      estado: 'CONFIRMADO'
    }
  ];

  useEffect(() => {
    // Simular carga de historial
    setTimeout(() => {
      setVotingHistory(mockVotingHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElectionTypeColor = (tipo) => {
    switch (tipo) {
      case 'Presidencial':
        return 'bg-purple-100 text-purple-800';
      case 'Municipal':
        return 'bg-blue-100 text-blue-800';
      case 'Regional':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Historial de Votación</h1>
              <p className="mt-2 text-gray-600">Registro de todas sus participaciones electorales</p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Votos</dt>
                  <dd className="text-lg font-medium text-gray-900">{votingHistory.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Participación</dt>
                  <dd className="text-lg font-medium text-gray-900">100%</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Último Voto</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {votingHistory.length > 0 ? formatDate(votingHistory[0].fecha_voto).split(' ')[0] : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Historial Detallado</h2>
          </div>
          
          {votingHistory.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin historial de votación</h3>
              <p className="mt-1 text-sm text-gray-500">Aún no ha participado en ninguna elección.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {votingHistory.map((vote) => (
                  <li key={vote.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">{vote.eleccion.nombre}</p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getElectionTypeColor(vote.eleccion.tipo)}`}>
                              {vote.eleccion.tipo}
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-600">
                              Votó por: <span className="font-medium">{vote.candidato.nombre}</span> - {vote.candidato.cargo}
                            </p>
                            <p className="text-sm text-gray-500">Lista: {vote.candidato.lista}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm text-gray-500">{formatDate(vote.fecha_voto)}</p>
                        <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {vote.estado}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Información sobre el historial</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Este historial muestra todas sus participaciones electorales confirmadas. 
                  Los votos son anónimos y seguros, solo se registra su participación, no su elección específica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingHistory;

