import { useState } from 'react';

const SuperAdminDemo = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const mockData = {
    tenants: [
      { id: 1, nombre: 'Universidad Nacional', usuarios: 1250, elecciones: 5, estado: 'Activo' },
      { id: 2, nombre: 'Empresa Tech Corp', usuarios: 450, elecciones: 2, estado: 'Activo' },
      { id: 3, nombre: 'Sindicato Trabajadores', usuarios: 890, elecciones: 3, estado: 'Activo' }
    ],
    reportes: {
      facturacion: [
        { tenant: 'Universidad Nacional', votos: 3450, costo: '$1,725' },
        { tenant: 'Empresa Tech Corp', votos: 890, costo: '$445' },
        { tenant: 'Sindicato Trabajadores', votos: 2100, costo: '$1,050' }
      ],
      totales: {
        tenants: 15,
        elecciones: 47,
        votos: 12450,
        ingresos: '$6,225'
      }
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-xl">🏢</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold">{mockData.reportes.totales.tenants}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Elecciones</p>
              <p className="text-2xl font-bold">{mockData.reportes.totales.elecciones}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-xl">🗳️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Votos</p>
              <p className="text-2xl font-bold">{mockData.reportes.totales.votos.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold">{mockData.reportes.totales.ingresos}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🚀 Acciones Rápidas</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('reportes')}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white">📈</span>
                </div>
                <div>
                  <h4 className="font-medium">Ver Reportes</h4>
                  <p className="text-sm text-gray-500">Reportes de uso y facturación</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('tenants')}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white">👥</span>
                </div>
                <div>
                  <h4 className="font-medium">Gestionar Tenants</h4>
                  <p className="text-sm text-gray-500">Administrar organizaciones</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => alert('Configuración Global - Funcionalidad disponible')}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white">⚙️</span>
                </div>
                <div>
                  <h4 className="font-medium">Configuración Global</h4>
                  <p className="text-sm text-gray-500">Configuración del sistema</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🛡️ Estado del Sistema</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estado del Servidor</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Operativo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base de Datos</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Conectada</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cifrado</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Activo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Firmas Digitales</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Habilitadas</span>
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
  );

  const renderTenants = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Tenants</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Nuevo Tenant
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organización</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Elecciones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockData.tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{tenant.nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {tenant.usuarios.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {tenant.elecciones}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {tenant.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button className="text-red-600 hover:text-red-900">Suspender</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReportes = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reportes de Facturación</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Facturación por Tenant</h3>
          <div className="space-y-3">
            {mockData.reportes.facturacion.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{item.tenant}</p>
                  <p className="text-sm text-gray-500">{item.votos.toLocaleString()} votos</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{item.costo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Resumen Financiero</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Tenants Activos:</span>
              <span className="font-bold">{mockData.reportes.totales.tenants}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Elecciones:</span>
              <span className="font-bold">{mockData.reportes.totales.elecciones}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Votos Procesados:</span>
              <span className="font-bold">{mockData.reportes.totales.votos.toLocaleString()}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Ingresos Totales:</span>
              <span className="font-bold text-green-600">{mockData.reportes.totales.ingresos}</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Exportar Reporte CSV
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Urna Virtual - Demo Super Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Super Admin</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Super Administrador
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

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('tenants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tenants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏢 Tenants
            </button>
            <button
              onClick={() => setActiveTab('reportes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reportes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📈 Reportes
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'tenants' && renderTenants()}
          {activeTab === 'reportes' && renderReportes()}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDemo;

