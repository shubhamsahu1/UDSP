import api from './api';

export const reportsService = {
  // Get report data by date range
  getReportData: async (startDate, endDate) => {
    try {
      const response = await api.get('/reports/data', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Export report data as CSV
  exportCSV: async (startDate, endDate) => {
    try {
      const response = await api.get('/reports/export-csv', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `UDSP_Report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'CSV downloaded successfully' };
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Get summary statistics for date range
  getSummary: async (startDate, endDate) => {
    try {
      const response = await api.get('/reports/summary', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }
};