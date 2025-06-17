import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import VotingInterface from './components/VotingInterface';
import RealTimeMetrics from './components/RealTimeMetrics';
import SuperAdminReports from './components/SuperAdminReports';
import SuperAdminDemo from './components/SuperAdminDemo';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/demo" element={<SuperAdminDemo />} />
              
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
                path="/vote/:electionId" 
                element={
                  <ProtectedRoute requiredRole="VOTANTE">
                    <VotingInterface />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/metrics/:electionId" 
                element={
                  <ProtectedRoute requiredRole="TENANT_ADMIN">
                    <RealTimeMetrics />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <SuperAdminReports />
                  </ProtectedRoute>
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
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

