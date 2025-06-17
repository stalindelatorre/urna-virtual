import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  FileText,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import '../App.css';

const SuperAdminReports = () => {
  const { user } = useAuth();
  const [platformUsage, setPlatformUsage] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  useEffect(() => {
    if (user?.rol === 'SUPER_ADMIN') {
      loadReports();
    }
  }, [user, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [usageResponse, statsResponse] = await Promise.all([
        reportsAPI.getPlatformUsage(dateRange.startDate, dateRange.endDate),
        reportsAPI.getGlobalStats()
      ]);

      setPlatformUsage(usageResponse.data);
      setGlobalStats(statsResponse.data);
      setError('');
    } catch (error) {
      console.error('Error loading reports:', error);
      setError('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const downloadReport = async (reportType) => {
    try {
      let response;
      switch (reportType) {
        case 'platform_usage':
          response = await reportsAPI.getPlatformUsage(dateRange.startDate, dateRange.endDate);
          break;
        case 'global_stats':
          response = await reportsAPI.getGlobalStats();
          break;
        default:
          return;
      }

      // Create and download CSV
      const csvContent = convertToCSV(response.data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const convertToCSV = (data) => {
    if (!data || typeof data !== 'object') return '';
    
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).map(v => 
      typeof v === 'object' ? JSON.stringify(v) : v
    ).join(',');
    
    return `${headers}\n${values}`;
  };

  if (user?.rol !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">Solo los Super Administradores pueden acceder a estos reportes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportes de Super Administrador
          </h1>
          <p className="text-gray-600">
            Análisis de uso de la plataforma y métricas de facturación
          </p>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="startDate">Fecha Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Fecha Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
              </div>
              <Button onClick={loadReports} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Actualizar Reportes
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Global Statistics */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {globalStats.total_tenants}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {globalStats.total_users}
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
                    <p className="text-sm font-medium text-gray-600">Total Elecciones</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {globalStats.total_elections}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Votos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {globalStats.total_votes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Platform Usage Report */}
        {platformUsage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Facturación por Tenant
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadReport('platform_usage')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </CardTitle>
                <CardDescription>
                  Ingresos generados por cada tenant en el período seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {platformUsage.tenant_billing && platformUsage.tenant_billing.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformUsage.tenant_billing}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="tenant_name" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Facturación']}
                        />
                        <Bar dataKey="total_billing" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No hay datos de facturación para el período seleccionado
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Uso por Tenant
                </CardTitle>
                <CardDescription>
                  Distribución de elecciones y votos por tenant
                </CardDescription>
              </CardHeader>
              <CardContent>
                {platformUsage.tenant_usage && platformUsage.tenant_usage.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformUsage.tenant_usage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="total_votes"
                        >
                          {platformUsage.tenant_usage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No hay datos de uso para mostrar
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Tenant List */}
        {platformUsage && platformUsage.tenant_details && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Detalle por Tenant
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadReport('global_stats')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todo
                </Button>
              </CardTitle>
              <CardDescription>
                Información detallada de uso y facturación por tenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tenant</th>
                      <th className="text-left p-2">País</th>
                      <th className="text-right p-2">Elecciones</th>
                      <th className="text-right p-2">Usuarios</th>
                      <th className="text-right p-2">Votos</th>
                      <th className="text-right p-2">Facturación</th>
                      <th className="text-center p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformUsage.tenant_details.map((tenant, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{tenant.tenant_name}</td>
                        <td className="p-2">{tenant.country || 'N/A'}</td>
                        <td className="p-2 text-right">{tenant.total_elections}</td>
                        <td className="p-2 text-right">{tenant.total_users}</td>
                        <td className="p-2 text-right">{tenant.total_votes}</td>
                        <td className="p-2 text-right font-medium">
                          ${tenant.total_billing?.toFixed(2) || '0.00'}
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant={tenant.active ? 'default' : 'secondary'}>
                            {tenant.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {platformUsage && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Resumen del Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${platformUsage.summary?.total_revenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Elecciones Realizadas</p>
                  <p className="text-2xl font-bold text-green-900">
                    {platformUsage.summary?.total_elections || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Votos Procesados</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {platformUsage.summary?.total_votes || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuperAdminReports;

