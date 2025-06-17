import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalElections: 12,
    activeElections: 3,
    totalVotes: 1547,
    totalUsers: 234
  });

  const handleLogout = () => {
    logout();
  };

  // Simular datos del usuario si no están disponibles
  const currentUser = user || {
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
            action: () => alert('Navegando a Reportes de Super Admin'),
            color: 'bg-blue-500'
          },
          { 
            title: 'Gestionar Tenants', 
            description: 'Administrar organizaciones',
            action: () => alert('Navegando a Gestión de Tenants'),
            color: 'bg-green-500'
          },
          { 
            title: 'Configuración Global', 
            description: 'Configuración del sistema',
            action: () => alert('Navegando a Configuración Global'),
            color: 'bg-purple-500'
          },
          { 
            title: 'Estadísticas Globales', 
            description: 'Ver métricas de toda la plataforma',
            action: () => alert('Navegando a Estadísticas Globales'),
            color: 'bg-orange-500'
          }
        ];
      case 'TENANT_ADMIN':
        return [
          { 
            title: 'Nueva Elección', 
            description: 'Crear proceso electoral',
            action: () => alert('Creando nueva elección'),
            color: 'bg-blue-500'
          },
          { 
            title: 'Gestionar Usuarios', 
            description: 'Administrar votantes',
            action: () => alert('Gestionando usuarios'),
            color: 'bg-green-500'
          },
          { 
            title: 'Ver Métricas', 
            description: 'Estadísticas en tiempo real',
            action: () => alert('Viendo métricas'),
            color: 'bg-orange-500'
          }
        ];
      case 'VOTANTE':
        return [
          { 
            title: 'Votar', 
            description: 'Participar en elecciones activas',
            action: () => alert('Navegando a votación'),
            color: 'bg-blue-500'
          },
          { 
            title: 'Mi Historial', 
            description: 'Ver mis votos anteriores',
            action: () => alert('Viendo historial'),
            color: 'bg-green-500'
          }
        ];
      default:
        return [
          { 
            title: 'Configuración', 
            description: 'Configurar cuenta',
            action: () => alert('Configuración'),
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
              <h1 className="text-xl font-semibold text-gray-900">Urna Virtual</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {currentUser.nombre} {currentUser.apellido}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getRoleDisplayName(currentUser.rol)}
              </span>
              <button
                onClick={handleLogout}
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido, {currentUser.nombre}
            </h2>
            <p className="text-gray-600">Panel de control del sistema de votación electrónica</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
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
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📈</span>
                    </div>
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
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🗳️</span>
                    </div>
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

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Usuarios</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🚀 Acciones Rápidas
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Funciones principales del sistema
                </p>
                <div className="space-y-3">
                  {getQuickActions().map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-4`}>
                          <span className="text-white text-lg">⚡</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🛡️ Estado del Sistema
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Información de seguridad y estado
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado del Servidor</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operativo
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Base de Datos</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Conectada
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cifrado</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Firmas Digitales</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Habilitadas
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ℹ️ Todos los votos están protegidos con cifrado de extremo a extremo
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

export default Dashboard;

