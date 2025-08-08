import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const VotingInterface = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Datos de prueba para elecciones activas
  const mockElections = [
    {
      id: 1,
      nombre: 'Elección Presidencial 2024',
      descripcion: 'Elección para presidente de la república',
      fecha_inicio: '2024-03-01T08:00:00',
      fecha_fin: '2024-03-01T18:00:00',
      estado: 'ACTIVE'
    },
    {
      id: 2,
      nombre: 'Elección Municipal',
      descripcion: 'Elección para alcalde municipal',
      fecha_inicio: '2024-04-15T08:00:00',
      fecha_fin: '2024-04-15T18:00:00',
      estado: 'ACTIVE'
    }
  ];

  // Datos de prueba para candidatos
  const mockCandidates = {
    1: [
      {
        id: 1,
        nombre: 'Ana',
        apellido: 'Rodríguez',
        cargo: { nombre: 'Presidente' },
        lista: { nombre: 'Partido Azul', color: '#3B82F6', siglas: 'PA' },
        numero_lista: 1,
        propuestas: 'Educación gratuita, salud universal, empleo digno'
      },
      {
        id: 2,
        nombre: 'Luis',
        apellido: 'Martínez',
        cargo: { nombre: 'Presidente' },
        lista: { nombre: 'Partido Rojo', color: '#EF4444', siglas: 'PR' },
        numero_lista: 2,
        propuestas: 'Seguridad ciudadana, desarrollo económico, infraestructura'
      },
      {
        id: 3,
        nombre: 'María',
        apellido: 'González',
        cargo: { nombre: 'Presidente' },
        lista: { nombre: 'Lista Verde', color: '#10B981', siglas: 'LV' },
        numero_lista: 3,
        propuestas: 'Medio ambiente, energías renovables, agricultura sostenible'
      }
    ],
    2: [
      {
        id: 4,
        nombre: 'Carlos',
        apellido: 'López',
        cargo: { nombre: 'Alcalde' },
        lista: { nombre: 'Movimiento Ciudadano', color: '#F59E0B', siglas: 'MC' },
        numero_lista: 1,
        propuestas: 'Transporte público, espacios verdes, participación ciudadana'
      },
      {
        id: 5,
        nombre: 'Elena',
        apellido: 'Vargas',
        cargo: { nombre: 'Alcalde' },
        lista: { nombre: 'Alianza Local', color: '#8B5CF6', siglas: 'AL' },
        numero_lista: 2,
        propuestas: 'Servicios básicos, desarrollo urbano, cultura y deporte'
      }
    ]
  };

  useEffect(() => {
    // Simular carga de elecciones activas
    setTimeout(() => {
      setElections(mockElections);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (selectedElection) {
      setCandidates(mockCandidates[selectedElection.id] || []);
      setSelectedCandidate(null);
    }
  }, [selectedElection]);

  const handleVote = async () => {
    if (!selectedCandidate || !selectedElection) return;

    try {
      setLoading(true);
      
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la llamada real a la API
      console.log('Votando por:', {
        electionId: selectedElection.id,
        candidateId: selectedCandidate.id,
        userId: user?.id
      });

      setHasVoted(true);
      alert('¡Voto registrado exitosamente!');
      
    } catch (error) {
      console.error('Error al votar:', error);
      alert('Error al registrar el voto. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando elecciones...</p>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Voto Registrado!</h2>
          <p className="text-gray-600 mb-6">Su voto ha sido registrado exitosamente en el sistema.</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Votación</h1>
          <p className="mt-2 text-gray-600">Seleccione una elección y su candidato preferido</p>
        </div>

        {/* Selección de Elección */}
        {!selectedElection && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Elecciones Activas</h2>
            <div className="space-y-4">
              {elections.map((election) => (
                <div
                  key={election.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                  onClick={() => setSelectedElection(election)}
                >
                  <h3 className="text-lg font-medium text-gray-900">{election.nombre}</h3>
                  <p className="text-gray-600 mt-1">{election.descripcion}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Inicio: {formatDate(election.fecha_inicio)}</p>
                    <p>Fin: {formatDate(election.fecha_fin)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selección de Candidato */}
        {selectedElection && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{selectedElection.nombre}</h2>
              <button
                onClick={() => setSelectedElection(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Cambiar elección
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCandidate?.id === candidate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3"
                      style={{ backgroundColor: candidate.lista.color }}
                    >
                      {candidate.lista.siglas}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {candidate.nombre} {candidate.apellido}
                      </h3>
                      <p className="text-sm text-gray-600">{candidate.cargo.nombre}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">{candidate.lista.nombre}</p>
                    <p className="text-sm text-gray-600">Lista #{candidate.numero_lista}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-700 font-medium mb-1">Propuestas:</p>
                    <p className="text-xs text-gray-600">{candidate.propuestas}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedCandidate && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Confirmación de Voto</h3>
                <p className="text-gray-700 mb-4">
                  Ha seleccionado a <strong>{selectedCandidate.nombre} {selectedCandidate.apellido}</strong> 
                  {' '}de la lista <strong>{selectedCandidate.lista.nombre}</strong> 
                  {' '}para el cargo de <strong>{selectedCandidate.cargo.nombre}</strong>.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleVote}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Registrando...' : 'Confirmar Voto'}
                  </button>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingInterface;

