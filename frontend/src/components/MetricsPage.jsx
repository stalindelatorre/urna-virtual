import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MetricsPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Datos de prueba para métricas
  const mockMetrics = {
    today: {
      totalVotes: 1247,
      activeElections: 3,
      participationRate: 68.5,
      systemHealth: 99.2,
      recentActivity: [
        { time: '14:30', event: 'Nuevo voto registrado', election: 'Elección Presidencial' },
        { time: '14:25', event: 'Usuario registrado', user: 'María González' },
        { time: '14:20', event: 'Elección activada', election: 'Elección Municipal' },
        { time: '14:15', event: 'Nuevo voto registrado', election: 'Elección Regional' },
        { time: '14:10', event: 'Sistema actualizado', version: 'v2.1.3' }
      ],
      electionStats: [
        { name: 'Elección Presidencial', votes: 856, participation: 72.1 },
        { name: 'Elección Municipal', votes: 234, participation: 45.8 },
        { name: 'Elección Regional', votes: 157, participation: 89.2 }
      ]
    },
    week: {
      totalVotes: 8934,
      activeElections: 5,
      participationRate: 74.2,
      systemHealth: 98.8,
      recentActivity: [
        { time: 'Lunes', event: '1,234 votos registrados', election: 'Múltiples elecciones' },
        { time: 'Martes', event: '1,456 votos registrados', election: 'Múltiples elecciones' },
        { time: 'Miércoles', event: '1,123 votos registrados', election: 'Múltiples elecciones' },
        { time: 'Jueves', event: '1,567 votos registrados', election: 'Múltiples elecciones' },
        { time: 'Viernes', event: '1,789 votos registrados', election: 'Múltiples elecciones' }
      ],
      electionStats: [
        { name: 'Elección Presidencial', votes: 5234, participation: 78.5 },
        { name: 'Elección Municipal', votes: 2156, participation: 67.3 },
        { name: 'Elección Regional', votes: 1544, participation: 82.1 }
      ]
    },
    month: {
      totalVotes: 34567,
      activeElections: 12,
      participationRate: 81.3,
      systemHealth: 99.5,
      recentActivity: [
        { time: 'Semana 1', event: '8,234 votos registrados', election: 'Múltiples elecciones' },
        { time: 'Semana 2', event: '9,456 votos registrados', election: 'Múltiples elecciones' },
        { time: 'Semana 3', event: '8,123 votos registrados', election: 'Múltiples elecciones' },
        { time: 'Semana 4', event: '8,754 votos registrados', election: 'Múltiples elecciones' }
      ],
      electionStats: [
        { name: 'Elección Presidencial', votes: 18234, participation: 85.2 },
        { name: 'Elección Municipal', votes: 9876, participation: 72.8 },
        { name: 'Elección Regional', votes: 6457, participation: 89.1 }
      ]
    }
  };

  useEffect(() => {
    // Simular carga de métricas
    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, []);

  const currentMetrics = metrics?.[selectedPeriod];

  const getHealthColor = (health) => {
    if (health >= 99) return 'text-green-600';
    if (health >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getParticipationColor = (rate) => {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Métricas del Sistema</h1>
              <p className="mt-2 text-gray-600">Estadísticas en tiempo real del sistema electoral</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
              </select>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <dd className="text-lg font-medium text-gray-900">{currentMetrics?.totalVotes.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Elecciones Activas</dt>
                  <dd className="text-lg font-medium text-gray-900">{currentMetrics?.activeElections}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Participación</dt>
                  <dd className="text-lg font-medium text-gray-900">{currentMetrics?.participationRate}%</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Salud del Sistema</dt>
                  <dd className={`text-lg font-medium ${getHealthColor(currentMetrics?.systemHealth)}`}>
                    {currentMetrics?.systemHealth}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estadísticas por elección */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Estadísticas por Elección</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {currentMetrics?.electionStats.map((election, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{election.name}</p>
                      <p className="text-sm text-gray-500">{election.votes.toLocaleString()} votos</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getParticipationColor(election.participation)}`}>
                      {election.participation}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Actividad Reciente</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {currentMetrics?.recentActivity.map((activity, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== currentMetrics.recentActivity.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">{activity.event}</p>
                              {activity.election && (
                                <p className="text-xs text-gray-400">{activity.election}</p>
                              )}
                              {activity.user && (
                                <p className="text-xs text-gray-400">{activity.user}</p>
                              )}
                              {activity.version && (
                                <p className="text-xs text-gray-400">{activity.version}</p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
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
              <h3 className="text-sm font-medium text-blue-800">Información sobre las métricas</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Las métricas se actualizan en tiempo real y reflejan el estado actual del sistema electoral. 
                  Los datos incluyen votos confirmados, participación ciudadana y salud del sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;

