import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

class MetricsService {
  async getDashboardMetrics() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.METRICS.DASHBOARD);
      return {
        success: true,
        data: response.data || response,
        message: 'Métricas del dashboard obtenidas exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }

  async getSystemHealth() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.METRICS.SYSTEM_HEALTH);
      return {
        success: true,
        data: response.data || response,
        message: 'Salud del sistema obtenida exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }

  async getElectionMetrics(electionId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.METRICS.ELECTION_METRICS(electionId));
      return {
        success: true,
        data: response.data || response,
        message: 'Métricas de elección obtenidas exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        error: error
      };
    }
  }

  // Simulación de datos para desarrollo
  getMockDashboardMetrics() {
    return {
      totalUsers: 1250,
      activeUsers: 980,
      totalElections: 15,
      activeElections: 5,
      totalVotes: 15000,
      pendingVotes: 200,
      systemStatus: 'Operativo',
      lastUpdate: new Date().toLocaleString()
    };
  }

  getMockSystemHealth() {
    return {
      cpuUsage: '35%',
      memoryUsage: '60%',
      diskUsage: '45%',
      networkTraffic: '120 Mbps',
      databaseConnections: 50,
      apiResponseTime: '150 ms',
      lastBackup: '2025-08-07 02:00:00'
    };
  }
}

const metricsService = new MetricsService();
export default metricsService;

