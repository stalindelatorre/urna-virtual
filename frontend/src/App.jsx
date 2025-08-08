import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DashboardDemo from './components/DashboardDemo';
import AdminPanel from './components/AdminPanel';
import AdminPanelDemo from './components/AdminPanelDemo';
import VotingInterface from './components/VotingInterface';
import VotingHistory from './components/VotingHistory';
import MetricsPage from './components/MetricsPage';
import ProfilePage from './components/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/voting" 
              element={
                <ProtectedRoute requiredRole="VOTANTE">
                  <VotingInterface />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/voting/history" 
              element={
                <ProtectedRoute requiredRole="VOTANTE">
                  <VotingHistory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/metrics" 
              element={
                <ProtectedRoute requiredRole="TENANT_ADMIN">
                  <MetricsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="TENANT_ADMIN">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Demo Routes (sin autenticación) */}
            <Route path="/dashboard-demo" element={<DashboardDemo />} />
            <Route path="/admin-demo" element={<AdminPanelDemo />} />
            <Route path="/voting-demo" element={<VotingInterface />} />
            <Route path="/voting-history-demo" element={<VotingHistory />} />
            <Route path="/metrics-demo" element={<MetricsPage />} />
            <Route path="/profile-demo" element={<ProfilePage />} />
            
            {/* Placeholder routes for Super Admin */}
            <Route 
              path="/super-admin/reports" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Reportes de Super Admin</h1>
                    <p className="text-gray-600 mb-8">Funcionalidad en desarrollo</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Volver al Dashboard
                    </button>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/super-admin/tenants" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Tenants</h1>
                    <p className="text-gray-600 mb-8">Funcionalidad en desarrollo</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Volver al Dashboard
                    </button>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/super-admin/config" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuración Global</h1>
                    <p className="text-gray-600 mb-8">Funcionalidad en desarrollo</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Volver al Dashboard
                    </button>
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/super-admin/metrics" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Estadísticas Globales</h1>
                    <p className="text-gray-600 mb-8">Funcionalidad en desarrollo</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Volver al Dashboard
                    </button>
                  </div>
                </div>
              } 
            />
            
            {/* Unauthorized Route */}
            <Route 
              path="/unauthorized" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
                    <p className="text-xl text-gray-600 mb-8">No tienes permisos para acceder a esta página</p>
                    <button 
                      onClick={() => window.history.back()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Volver
                    </button>
                  </div>
                </div>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Ir al Dashboard
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

