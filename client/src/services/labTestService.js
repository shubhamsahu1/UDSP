import api from './api';

export const labTestService = {
  // Get all lab tests
  getAll: async () => {
    try {
      const response = await api.get('/labtests');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Get single lab test by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/labtests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Create new lab test
  create: async (labTestData) => {
    try {
      const response = await api.post('/labtests', labTestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Update lab test
  update: async (id, labTestData) => {
    try {
      const response = await api.put(`/labtests/${id}`, labTestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Delete lab test
  delete: async (id) => {
    try {
      const response = await api.delete(`/labtests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }
};