import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { electionsAPI, candidatesAPI, votesAPI } from '../library/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Vote, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Calendar,
  Shield
} from 'lucide-react';
import '../App.css';

const VotingInterface = ({ electionId }) => {
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voteStatus, setVoteStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadElectionData();
    checkVoteStatus();
  }, [electionId]);

  const loadElectionData = async () => {
    try {
      const [electionResponse, candidatesResponse] = await Promise.all([
        electionsAPI.getById(electionId),
        candidatesAPI.getAll()
      ]);

      setElection(electionResponse.data);
      
      // Filter candidates for this election
      const electionCandidates = candidatesResponse.data.filter(
        candidate => candidate.eleccion_id === electionId
      );
      setCandidates(electionCandidates);
    } catch (error) {
      console.error('Error loading election data:', error);
      setError('Error al cargar los datos de la elección');
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const response = await votesAPI.getMyVote(electionId);
      setVoteStatus(response.data);
    } catch (error) {
      // User hasn't voted yet, which is fine
      setVoteStatus(null);
    }
  };

  const handleCandidateSelection = (cargoId, candidateId) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [cargoId]: candidateId
    }));
  };

  const handleVote = async () => {
    if (Object.keys(selectedCandidates).length === 0) {
      setError('Debes seleccionar al menos un candidato');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const candidateIds = Object.values(selectedCandidates);
      await votesAPI.cast({
        eleccion_id: electionId,
        candidatos_seleccionados: candidateIds
      });

      // Refresh vote status
      await checkVoteStatus();
      setSelectedCandidates({});
    } catch (error) {
      console.error('Error casting vote:', error);
      setError(error.response?.data?.detail || 'Error al emitir el voto');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Elección no encontrada</h2>
            <p className="text-gray-600">La elección solicitada no existe o no tienes permisos para acceder.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has already voted
  if (voteStatus?.ha_votado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Voto Registrado</h2>
            <p className="text-gray-600 mb-4">
              Tu voto ha sido registrado exitosamente en esta elección.
            </p>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <Shield className="h-4 w-4 inline mr-1" />
                Tu voto está protegido con cifrado de extremo a extremo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if election is active
  const now = new Date();
  const startDate = new Date(election.fecha_inicio);
  const endDate = new Date(election.fecha_fin);
  const isActive = election.estado === 'ACTIVA' && now >= startDate && now <= endDate;

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Elección no disponible</h2>
            <p className="text-gray-600 mb-4">
              Esta elección no está activa en este momento.
            </p>
            <div className="text-sm text-gray-500">
              <p>Estado: <Badge variant="outline">{election.estado}</Badge></p>
              {election.fecha_inicio && (
                <p>Inicio: {new Date(election.fecha_inicio).toLocaleString()}</p>
              )}
              {election.fecha_fin && (
                <p>Fin: {new Date(election.fecha_fin).toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group candidates by cargo
  const candidatesByCargo = candidates.reduce((acc, candidate) => {
    const cargoId = candidate.cargo_id;
    if (!acc[cargoId]) {
      acc[cargoId] = {
        cargo: candidate.cargo,
        candidates: []
      };
    }
    acc[cargoId].candidates.push(candidate);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.titulo}</h1>
          <p className="text-gray-600 mb-4">{election.descripcion}</p>
          
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(election.fecha_fin).toLocaleString()}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Votante: {user?.nombre} {user?.apellido}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Voting Form */}
        <div className="space-y-6">
          {Object.entries(candidatesByCargo).map(([cargoId, cargoData]) => (
            <Card key={cargoId}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Vote className="h-5 w-5 mr-2" />
                  {cargoData.cargo.nombre}
                </CardTitle>
                <CardDescription>
                  {cargoData.cargo.descripcion}
                  <br />
                  <span className="text-sm text-blue-600">
                    Selecciona {cargoData.cargo.max_candidatos_a_elegir} candidato(s)
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedCandidates[cargoId] || ''}
                  onValueChange={(value) => handleCandidateSelection(cargoId, value)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cargoData.candidates.map((candidate) => (
                      <div key={candidate.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={candidate.id} id={candidate.id} />
                        <div className="flex-1">
                          <Label htmlFor={candidate.id} className="cursor-pointer">
                            <div className="flex items-center space-x-3">
                              {candidate.foto_url && (
                                <img
                                  src={candidate.foto_url}
                                  alt={`${candidate.nombre} ${candidate.apellido}`}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">
                                  {candidate.nombre} {candidate.apellido}
                                </p>
                                {candidate.partido && (
                                  <p className="text-sm text-gray-600">{candidate.partido}</p>
                                )}
                                {candidate.propuestas && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {candidate.propuestas.substring(0, 100)}...
                                  </p>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          {/* Vote Button */}
          <div className="text-center">
            <Button
              onClick={handleVote}
              disabled={voting || Object.keys(selectedCandidates).length === 0}
              size="lg"
              className="px-8"
            >
              {voting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Emitiendo voto...
                </div>
              ) : (
                <div className="flex items-center">
                  <Vote className="h-4 w-4 mr-2" />
                  Emitir Voto
                </div>
              )}
            </Button>
            
            <div className="mt-4 text-xs text-gray-500 max-w-md mx-auto">
              <p>
                <Shield className="h-3 w-3 inline mr-1" />
                Tu voto será cifrado y firmado digitalmente para garantizar su seguridad e integridad.
                Una vez emitido, no podrá ser modificado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingInterface;

