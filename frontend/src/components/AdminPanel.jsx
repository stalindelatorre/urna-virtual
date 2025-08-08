import React, { useState, useEffect } from 'react';
import { useUsers, useElections, useCandidates, useMetrics } from '../hooks/useApi.js';
import { useCargos } from '../hooks/useCargos.js';
import { useListas } from '../hooks/useListas.js';
import { validateUserData, validateElectionData, validateCandidateData, formatUserForDisplay, formatElectionForDisplay } from '../library/api_integration.js';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Hooks para diferentes entidades
  const {
    users,
    loading: usersLoading,
    error: usersError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser
  } = useUsers();

  const {
    elections,
    loading: electionsLoading,
    error: electionsError,
    fetchElections,
    createElection,
    updateElection,
    deleteElection,
    activateElection,
    closeElection
  } = useElections();

  const {
    candidates,
    loading: candidatesLoading,
    error: candidatesError,
    fetchCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate
  } = useCandidates();

  const {
    cargos,
    loading: cargosLoading,
    error: cargosError,
    fetchCargos,
    createCargo,
    updateCargo,
    deleteCargo
  } = useCargos();

  const {
    listas,
    loading: listasLoading,
    error: listasError,
    fetchListas,
    createLista,
    updateLista,
    deleteLista,
    uploadLogo,
    deleteLogo
  } = useListas();

  const {
    loading: metricsLoading,
    getSystemHealth
  } = useMetrics();

  // Cargar datos iniciales
  useEffect(() => {
    fetchUsers();
    fetchElections();
    fetchCandidates();
    fetchCargos();
    fetchListas();
  }, [fetchUsers, fetchElections, fetchCandidates, fetchCargos, fetchListas]);

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
    
    let validation;
    let apiCall;

    switch (modalType) {
      case 'createUser':
      case 'editUser':
        validation = validateUserData(formData);
        if (!validation.isValid) {
          setFormErrors(validation.errors);
          return;
        }
        apiCall = selectedItem 
          ? () => updateUser(selectedItem.id, formData)
          : () => createUser(formData);
        break;

      case 'createElection':
      case 'editElection':
        validation = validateElectionData(formData);
        if (!validation.isValid) {
          setFormErrors(validation.errors);
          return;
        }
        apiCall = selectedItem 
          ? () => updateElection(selectedItem.id, formData)
          : () => createElection(formData);
        break;

      case 'createCandidate':
      case 'editCandidate':
        validation = validateCandidateData(formData);
        if (!validation.isValid) {
          setFormErrors(validation.errors);
          return;
        }
        apiCall = selectedItem 
          ? () => updateCandidate(selectedItem.id, formData)
          : () => createCandidate(formData);
        break;

      case 'createCargo':
      case 'editCargo':
        if (!formData.nombre || formData.nombre.trim().length < 2) {
          setFormErrors({ nombre: 'Nombre debe tener al menos 2 caracteres' });
          return;
        }
        apiCall = selectedItem 
          ? () => updateCargo(selectedItem.id, formData)
          : () => createCargo(formData);
        break;

      case 'createLista':
      case 'editLista':
        if (!formData.nombre || formData.nombre.trim().length < 2) {
          setFormErrors({ nombre: 'Nombre debe tener al menos 2 caracteres' });
          return;
        }
        apiCall = selectedItem 
          ? () => updateLista(selectedItem.id, formData)
          : () => createLista(formData);
        break;

      default:
        return;
    }

    try {
      await apiCall();
      closeModal();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
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
      
      {usersLoading ? (
        <div className="p-6 text-center">Cargando usuarios...</div>
      ) : usersError ? (
        <div className="p-6 text-center text-red-600">Error: {usersError}</div>
      ) : (
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
                        onClick={() => user.activo ? deactivateUser(user.id) : activateUser(user.id)}
                        className={`mr-3 ${
                          user.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
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
      )}
    </div>
  );

  // Componente de tabla de elecciones
  const ElectionsTable = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Gestión de Elecciones</h3>
        <button
          onClick={() => openModal('createElection')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Crear Elección
        </button>
      </div>
      
      {electionsLoading ? (
        <div className="p-6 text-center">Cargando elecciones...</div>
      ) : electionsError ? (
        <div className="p-6 text-center text-red-600">Error: {electionsError}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
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
              {elections.map((election) => {
                const formattedElection = formatElectionForDisplay(election);
                return (
                  <tr key={election.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {election.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {election.descripcion?.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formattedElection.fechaInicioDisplay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formattedElection.fechaFinDisplay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        election.estado === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        election.estado === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formattedElection.estadoDisplay}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal('editElection', election)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      {election.estado === 'DRAFT' && (
                        <button
                          onClick={() => activateElection(election.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Activar
                        </button>
                      )}
                      {election.estado === 'ACTIVE' && (
                        <button
                          onClick={() => closeElection(election.id)}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                        >
                          Cerrar
                        </button>
                      )}
                      <button
                        onClick={() => deleteElection(election.id)}
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
      )}
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
      
      {candidatesLoading ? (
        <div className="p-6 text-center">Cargando candidatos...</div>
      ) : candidatesError ? (
        <div className="p-6 text-center text-red-600">Error: {candidatesError}</div>
      ) : (
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
                      onClick={() => deleteCandidate(candidate.id)}
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
      )}
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
      
      {cargosLoading ? (
        <div className="p-6 text-center">Cargando cargos...</div>
      ) : cargosError ? (
        <div className="p-6 text-center text-red-600">Error: {cargosError}</div>
      ) : (
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
                      onClick={() => deleteCargo(cargo.id)}
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
      )}
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
      
      {listasLoading ? (
        <div className="p-6 text-center">Cargando listas...</div>
      ) : listasError ? (
        <div className="p-6 text-center text-red-600">Error: {listasError}</div>
      ) : (
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
                      onClick={() => deleteLista(lista.id)}
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
      )}
    </div>
  );

  // Modal para formularios
  const Modal = () => {
    if (!showModal) return null;

    const getModalTitle = () => {
      switch (modalType) {
        case 'createUser': return 'Crear Usuario';
        case 'editUser': return 'Editar Usuario';
        case 'createElection': return 'Crear Elección';
        case 'editElection': return 'Editar Elección';
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
              {(modalType.includes('User')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formErrors.nombre && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      value={formData.apellido || ''}
                      onChange={(e) => handleInputChange('apellido', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formErrors.apellido && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.apellido}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <select
                      value={formData.rol || ''}
                      onChange={(e) => handleInputChange('rol', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="SUPER_ADMIN">Super Administrador</option>
                      <option value="TENANT_ADMIN">Administrador</option>
                      <option value="VOTANTE">Votante</option>
                    </select>
                    {formErrors.rol && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.rol}</p>
                    )}
                  </div>
                </>
              )}

              {(modalType.includes('Election')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formErrors.nombre && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      value={formData.descripcion || ''}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows="3"
                    />
                    {formErrors.descripcion && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.descripcion}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_inicio || ''}
                      onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formErrors.fecha_inicio && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.fecha_inicio}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_fin || ''}
                      onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formErrors.fecha_fin && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.fecha_fin}</p>
                    )}
                  </div>
                </>
              )}

              {(modalType.includes('Candidate')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formErrors.nombre && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      value={formData.apellido || ''}
                      onChange={(e) => handleInputChange('apellido', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    {formErrors.apellido && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.apellido}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cargo</label>
                    <select
                      value={formData.cargo_id || ''}
                      onChange={(e) => handleInputChange('cargo_id', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Seleccionar cargo</option>
                      {cargos.map(cargo => (
                        <option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>
                      ))}
                    </select>
                    {formErrors.cargo_id && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cargo_id}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lista/Partido</label>
                    <select
                      value={formData.lista_id || ''}
                      onChange={(e) => handleInputChange('lista_id', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Seleccionar lista</option>
                      {listas.map(lista => (
                        <option key={lista.id} value={lista.id}>{lista.nombre}</option>
                      ))}
                    </select>
                    {formErrors.lista_id && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.lista_id}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Lista</label>
                    <input
                      type="number"
                      value={formData.numero_lista || ''}
                      onChange={(e) => handleInputChange('numero_lista', parseInt(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </>
              )}

              {(modalType.includes('Cargo')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Cargo</label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Ej: Presidente, Alcalde, Concejal"
                    />
                    {formErrors.nombre && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      value={formData.descripcion || ''}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows="3"
                      placeholder="Descripción del cargo electoral"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel</label>
                    <select
                      value={formData.nivel || ''}
                      onChange={(e) => handleInputChange('nivel', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Seleccionar nivel</option>
                      <option value="NACIONAL">Nacional</option>
                      <option value="REGIONAL">Regional</option>
                      <option value="LOCAL">Local</option>
                    </select>
                  </div>
                </>
              )}

              {(modalType.includes('Lista')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de la Lista/Partido</label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Ej: Partido Democrático, Lista Independiente"
                    />
                    {formErrors.nombre && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      value={formData.descripcion || ''}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows="3"
                      placeholder="Descripción de la lista o partido político"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <input
                      type="color"
                      value={formData.color || '#3B82F6'}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Siglas</label>
                    <input
                      type="text"
                      value={formData.siglas || ''}
                      onChange={(e) => handleInputChange('siglas', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Ej: PD, LI"
                      maxLength="10"
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
              onClick={() => setActiveTab('elections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'elections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Elecciones
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
          {activeTab === 'elections' && <ElectionsTable />}
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

export default AdminPanel;

