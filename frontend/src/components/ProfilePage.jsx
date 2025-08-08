import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    documento_identidad: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Cargar datos del usuario o usar datos de prueba
    const userData = user || {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@ejemplo.com',
      telefono: '+1234567890',
      direccion: 'Calle Principal 123, Ciudad',
      fecha_nacimiento: '1990-05-15',
      documento_identidad: '12345678',
      rol: 'VOTANTE',
      fecha_registro: '2023-01-15T10:30:00'
    };

    setFormData({
      nombre: userData.nombre || '',
      apellido: userData.apellido || '',
      email: userData.email || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      fecha_nacimiento: userData.fecha_nacimiento || '',
      documento_identidad: userData.documento_identidad || ''
    });
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí iría la llamada real a la API
      console.log('Actualizando perfil:', formData);
      
      if (updateUser) {
        updateUser(formData);
      }
      
      setIsEditing(false);
      setMessage('Perfil actualizado exitosamente');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setMessage('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    const userData = user || {};
    setFormData({
      nombre: userData.nombre || '',
      apellido: userData.apellido || '',
      email: userData.email || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      fecha_nacimiento: userData.fecha_nacimiento || '',
      documento_identidad: userData.documento_identidad || ''
    });
    setIsEditing(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="mt-2 text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información básica */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Información Personal</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Editar
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.nombre || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => handleInputChange('apellido', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.apellido || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.email || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.telefono || 'No especificado'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.direccion || 'No especificado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.fecha_nacimiento}
                        onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{formatDate(formData.fecha_nacimiento)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Documento de Identidad</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.documento_identidad}
                        onChange={(e) => handleInputChange('documento_identidad', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.documento_identidad || 'No especificado'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información de cuenta */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Cuenta</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rol</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getRoleDisplayName(user?.rol || 'VOTANTE')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                  <p className="text-sm text-gray-900">{formatDate(user?.fecha_registro || '2023-01-15T10:30:00')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <button
                  onClick={() => alert('Funcionalidad de cambio de contraseña en desarrollo')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cambiar Contraseña
                </button>
                <button
                  onClick={() => window.location.href = '/voting/history'}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Ver Historial de Votos
                </button>
                <button
                  onClick={() => alert('Funcionalidad de configuración de notificaciones en desarrollo')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Configurar Notificaciones
                </button>
              </div>
            </div>

            {/* Seguridad */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Seguridad</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-sm text-gray-700">Email verificado</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-sm text-gray-700">Cuenta activa</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span className="text-sm text-gray-700">2FA no configurado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

