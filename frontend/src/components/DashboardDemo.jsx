import React, { useState } from 'react';

const DashboardDemo = () => {
  const [stats, setStats] = useState({
    totalElections: 12,
    activeElections: 3,
    totalVotes: 1547,
    totalUsers: 234
  });

  // Simular datos del usuario
  const currentUser = {
    nombre: 'Super',
    apellido: 'Admin',
    email: 'admin@test.com',
    rol: 'SUPER_ADMIN'
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Administrador';
      case 'TENANT_ADMIN':
        return 'Administrador';
      case 'VOTANTE':
        return 'Votante';
      default:
        return role;
    }
  };

  const getQuickActions = () => {
    switch (currentUser?.rol) {
      case 'SUPER_ADMIN':
        return [
          { 
            title: 'Ver Reportes', 
            description: 'Reportes de uso y facturación',
            action: () => window.location.href = '/super-admin/reports',
            color: 'bg-blue-500'
          },
          { 
            title: 'Panel de Administración', 
            description: 'Gestionar usuarios, elecciones y candidatos',
            action: () => window.location.href = '/admin-demo',
            color: 'bg-purple-500'
          },
          { 
            title: 'Gestionar Tenants', 
            description: 'Administrar organizaciones',
            action: () => window.location.href = '/super-admin/tenants',
            color: 'bg-green-500'
          },
          { 
            title: 'Configuración Global', 
            description: 'Configuración del sistema',
            action: () => window.location.href = '/super-admin/config',
            color: 'bg-purple-500'
          },
          { 
            title: 'Estadísticas Globales', 
            description: 'Ver métricas de toda la plataforma',
            action: () => window.location.href = '/super-admin/metrics',
            color: 'bg-orange-500'
          }
        ];
      case 'TENANT_ADMIN':
        return [
          { 
            title: 'Nueva Elección', 
            description: 'Crear proceso electoral',
            action: () => window.location.href = '/admin-demo?tab=elections&action=create',
            color: 'bg-blue-500'
          },
          { 
            title: 'Gestionar Usuarios', 
            description: 'Administrar votantes',
            action: () => window.location.href = '/admin-demo?tab=users',
            color: 'bg-green-500'
          },
          { 
            title: 'Ver Métricas', 
            description: 'Estadísticas en tiempo real',
            action: () => window.location.href = '/metrics-demo',
            color: 'bg-orange-500'
          }
        ];
      case 'VOTANTE':
        return [
          { 
            title: 'Votar', 
            description: 'Participar en elecciones activas',
            action: () => window.location.href = '/voting-demo',
            color: 'bg-blue-500'
          },
          { 
            title: 'Mi Historial', 
            description: 'Ver mis votos anteriores',
            action: () => window.location.href = '/voting-history-demo',
            color: 'bg-green-500'
          }
        ];
      default:
        return [
          { 
            title: 'Configuración', 
            description: 'Configurar cuenta',
            action: () => window.location.href = '/profile-demo',
            color: 'bg-gray-500'
          }
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Urna Virtual - Demo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {currentUser.nombre} {currentUser.apellido}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getRoleDisplayName(currentUser.rol)}
              </span>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido, {currentUser.nombre}
            </h2>
            <p className="text-gray-600">
              Panel de control del sistema de votación electrónica
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Elecciones</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalElections}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Elecciones Activas</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeElections}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Votos</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalVotes}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getQuickActions().map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity text-left`}
                  >
                    <h4 className="font-semibold text-lg mb-2">{action.title}</h4>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Modo Demo</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Esta es una versión de demostración del sistema. Todas las funcionalidades han sido implementadas 
                    para reemplazar las alertas anteriores con navegación real a páginas funcionales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardDemo;

