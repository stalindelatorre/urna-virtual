import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { metricsAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../App.css';

const RealTimeMetrics = ({ electionId }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [electionId]);

  const loadMetrics = async () => {
    try {
      const response = await metricsAPI.getRealTime(electionId);
      setMetrics(response.data);
      setError('');
    } catch (error) {
      console.error('Error loading metrics:', error);
      setError('Error al cargar las métricas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const participationRate = metrics.participation.participation_rate;
  const votingSpeed = metrics.voting_activity.voting_speed_per_minute;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Métricas en Tiempo Real
              </h1>
              <p className="text-gray-600">{metrics.election_title}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">En vivo</span>
              <Badge variant="outline" className="ml-2">
                {metrics.election_status}
              </Badge>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            Última actualización: {new Date(metrics.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Votantes Registrados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.participation.total_registered.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Votos Emitidos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.participation.total_voted.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Participación</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {participationRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Votos/min</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {votingSpeed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participation Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Progreso de Participación
              </CardTitle>
              <CardDescription>
                Porcentaje de votantes que han ejercido su voto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Participación actual</span>
                    <span className="font-medium">{participationRate}%</span>
                  </div>
                  <Progress value={participationRate} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Han votado</p>
                    <p className="text-lg font-semibold text-green-600">
                      {metrics.participation.total_voted.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pendientes</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {metrics.participation.remaining_voters.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Actividad de Votación
              </CardTitle>
              <CardDescription>
                Estadísticas de velocidad y estimaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Votos última hora</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.voting_activity.votes_last_hour}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Velocidad actual</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {votingSpeed} <span className="text-sm font-normal">votos/min</span>
                    </p>
                  </div>
                </div>
                
                {metrics.voting_activity.estimated_completion && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Finalización estimada: {' '}
                      {new Date(metrics.voting_activity.estimated_completion).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voting Pattern Chart */}
        {metrics.voting_activity.hourly_pattern && metrics.voting_activity.hourly_pattern.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Patrón de Votación (Últimas 12 horas)
              </CardTitle>
              <CardDescription>
                Número de votos emitidos por hora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.voting_activity.hourly_pattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(label) => `Hora: ${label}`}
                      formatter={(value) => [value, 'Votos']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="votes" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Información de salud y rendimiento del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Servidor</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {metrics.system_status.server_healthy ? 'Operativo' : 'Error'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de Datos</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {metrics.system_status.database_responsive ? 'Conectada' : 'Error'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Actualización</span>
                <Badge variant="outline">
                  Automática (30s)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeMetrics;

