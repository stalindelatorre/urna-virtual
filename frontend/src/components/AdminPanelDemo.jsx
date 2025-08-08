import React, { useState, useEffect } from 'react';

// Datos de prueba para demostración
const mockUsers = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan@test.com', rol: 'TENANT_ADMIN', activo: true },
  { id: 2, nombre: 'María', apellido: 'García', email: 'maria@test.com', rol: 'VOTANTE', activo: true },
  { id: 3, nombre: 'Carlos', apellido: 'López', email: 'carlos@test.com', rol: 'VOTANTE', activo: false }
];

const mockElections = [
  { id: 1, nombre: 'Elección Presidencial 2024', descripcion: 'Elección para presidente', fecha_inicio: '2024-03-01T08:00:00', fecha_fin: '2024-03-01T18:00:00', estado: 'DRAFT' },
  { id: 2, nombre: 'Elección Municipal', descripcion: 'Elección para alcalde', fecha_inicio: '2024-04-15T08:00:00', fecha_fin: '2024-04-15T18:00:00', estado: 'ACTIVE' }
];

const mockCandidates = [
  { id: 1, nombre: 'Ana', apellido: 'Rodríguez', cargo: { nombre: 'Presidente' }, lista: { nombre: 'Partido Azul' }, numero_lista: 1 },
  { id: 2, nombre: 'Luis', apellido: 'Martínez', cargo: { nombre: 'Presidente' }, lista: { nombre: 'Partido Rojo' }, numero_lista: 2 }
];

const mockCargos = [
  { id: 1, nombre: 'Presidente', descripcion: 'Cargo ejecutivo principal', nivel: 'NACIONAL' },
  { id: 2, nombre: 'Alcalde', descripcion: 'Autoridad municipal', nivel: 'LOCAL' },
  { id: 3, nombre: 'Gobernador', descripcion: 'Autoridad regional', nivel: 'REGIONAL' }
];

const mockListas = [
  { id: 1, nombre: 'Partido Azul', siglas: 'PA', color: '#3B82F6', descripcion: 'Partido político de centro' },
  { id: 2, nombre: 'Partido Rojo', siglas: 'PR', color: '#EF4444', descripcion: 'Partido político de izquierda' },
  { id: 3, nombre: 'Lista Verde', siglas: 'LV', color: '#10B981', descripcion: 'Lista ecologista independiente' }
];

const AdminPanelDemo = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Estados para los datos
  const [users, setUsers] = useState(mockUsers);
  const [elections, setElections] = useState(mockElections);
  const [candidates, setCandidates] = useState(mockCandidates);
  const [cargos, setCargos] = useState(mockCargos);
  const [listas, setListas] = useState(mockListas);

  // Funciones para manejar modales
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
    setFormData({});
    setFormErrors({});
  };

  // Función para manejar envío de formularios
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulación de validación y guardado
    console.log('Guardando:', modalType, formData);
    
    // Aquí iría la lógica real de guardado
    alert(`${selectedItem ? 'Actualizado' : 'Creado'} correctamente (Demo)`);
    closeModal();
  };

  // Función para manejar cambios en formularios
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Función para eliminar elementos
  const handleDelete = (type, id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      console.log('Eliminando:', type, id);
      alert('Eliminado correctamente (Demo)');
    }
  };

  // Funciones de formateo
  const formatUserForDisplay = (user) => ({
    ...user,
    nombreCompleto: `${user.nombre} ${user.apellido}`,
    rolDisplay: getRoleDisplayName(user.rol),
    estadoDisplay: user.activo ? 'Activo' : 'Inactivo'
  });

  const formatElectionForDisplay = (election) => ({
    ...election,
    fechaInicioDisplay: new Date(election.fecha_inicio).toLocaleDateString('es-ES'),
    fechaFinDisplay: new Date(election.fecha_fin).toLocaleDateString('es-ES'),
    estadoDisplay: getElectionStatusDisplay(election.estado)
  });

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrador';
      case 'TENANT_ADMIN': return 'Administrador';
      case 'VOTANTE': return 'Votante';
      default: return role;
    }
  };

  const getElectionStatusDisplay = (status) => {
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'ACTIVE': return 'Activa';
      case 'CLOSED': return 'Cerrada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  // Componente de tabla de usuarios
  const UsersTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
        <button
          onClick={() => openModal('createUser')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Crear Usuario
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const formattedUser = formatUserForDisplay(user);
              return (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formattedUser.nombreCompleto}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {formattedUser.rolDisplay}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {formattedUser.estadoDisplay}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal('editUser', user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete('user', user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Componente de tabla de candidatos
  const CandidatesTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Gestión de Candidatos</h3>
        <button
          onClick={() => openModal('createCandidate')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Crear Candidato
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lista/Partido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {candidate.nombre?.charAt(0)}{candidate.apellido?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.nombre} {candidate.apellido}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {candidate.cargo?.nombre || 'Sin cargo'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {candidate.lista?.nombre || 'Sin lista'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {candidate.numero_lista || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('editCandidate', candidate)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete('candidate', candidate.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Componente de tabla de cargos
  const CargosTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Gestión de Cargos</h3>
        <button
          onClick={() => openModal('createCargo')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Crear Cargo
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cargos.map((cargo) => (
              <tr key={cargo.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {cargo.nombre}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {cargo.descripcion?.substring(0, 100)}
                    {cargo.descripcion?.length > 100 && '...'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cargo.nivel === 'NACIONAL' ? 'bg-purple-100 text-purple-800' :
                    cargo.nivel === 'REGIONAL' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {cargo.nivel || 'Sin nivel'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('editCargo', cargo)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete('cargo', cargo.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Componente de tabla de listas/partidos
  const ListasTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Gestión de Listas/Partidos</h3>
        <button
          onClick={() => openModal('createLista')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Crear Lista/Partido
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lista/Partido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Siglas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {listas.map((lista) => (
              <tr key={lista.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: lista.color || '#3B82F6' }}
                    >
                      <span className="text-sm font-medium text-white">
                        {lista.siglas || lista.nombre?.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lista.nombre}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lista.siglas || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="h-4 w-4 rounded-full mr-2"
                      style={{ backgroundColor: lista.color || '#3B82F6' }}
                    ></div>
                    <span className="text-sm text-gray-900">
                      {lista.color || '#3B82F6'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {lista.descripcion?.substring(0, 100)}
                    {lista.descripcion?.length > 100 && '...'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('editLista', lista)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete('lista', lista.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Modal para formularios
  const Modal = () => {
    if (!showModal) return null;

    const getModalTitle = () => {
      switch (modalType) {
        case 'createUser': return 'Crear Usuario';
        case 'editUser': return 'Editar Usuario';
        case 'createCandidate': return 'Crear Candidato';
        case 'editCandidate': return 'Editar Candidato';
        case 'createCargo': return 'Crear Cargo';
        case 'editCargo': return 'Editar Cargo';
        case 'createLista': return 'Crear Lista/Partido';
        case 'editLista': return 'Editar Lista/Partido';
        default: return 'Formulario';
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {getModalTitle()}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ingrese el nombre"
                />
              </div>

              {modalType.includes('User') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      value={formData.apellido || ''}
                      onChange={(e) => handleInputChange('apellido', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {selectedItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración - Demo</h1>
          <p className="text-gray-600 mt-2">Gestión completa del sistema de urna virtual</p>
        </div>

        {/* Navegación por pestañas */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'candidates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Candidatos
            </button>
            <button
              onClick={() => setActiveTab('cargos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cargos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cargos
            </button>
            <button
              onClick={() => setActiveTab('listas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'listas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Listas/Partidos
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="space-y-6">
          {activeTab === 'users' && <UsersTable />}
          {activeTab === 'candidates' && <CandidatesTable />}
          {activeTab === 'cargos' && <CargosTable />}
          {activeTab === 'listas' && <ListasTable />}
        </div>
      </div>

      {/* Modal */}
      <Modal />
    </div>
  );
};

export default AdminPanelDemo;

