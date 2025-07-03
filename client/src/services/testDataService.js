import api from './api';

export const testDataService = {
  // Get lab tests for dropdown (accessible to all users)
  getLabTests: async () => {
    try {
      const response = await api.get('/testdata/labtests');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Get user's test data for a specific date
  getMyDataByDate: async (date) => {
    try {
      const response = await api.get(`/testdata/my/${date}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Create or update test data entry
  saveTestData: async (testData) => {
    try {
      const response = await api.post('/testdata', testData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Update specific test data entry
  updateTestData: async (id, testData) => {
    try {
      const response = await api.put(`/testdata/${id}`, testData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Delete test data entry
  deleteTestData: async (id) => {
    try {
      const response = await api.delete(`/testdata/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }
};