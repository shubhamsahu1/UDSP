import { labTestService } from '../labTestService';
import api from '../api';

// Mock the api module
jest.mock('../api');

describe('labTestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('should fetch all lab tests successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { _id: '1', name: 'Blood Test' },
            { _id: '2', name: 'Urine Test' }
          ],
          count: 2
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await labTestService.getAll();

      expect(api.get).toHaveBeenCalledWith('/labtests');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle API error', async () => {
      const mockError = {
        response: {
          data: { success: false, message: 'Server error' }
        }
      };

      api.get.mockRejectedValue(mockError);

      await expect(labTestService.getAll()).rejects.toEqual(mockError.response.data);
    });

    test('should handle network error', async () => {
      const mockError = new Error('Network Error');
      api.get.mockRejectedValue(mockError);

      await expect(labTestService.getAll()).rejects.toEqual({
        success: false,
        message: 'Network error'
      });
    });
  });

  describe('getById', () => {
    test('should fetch single lab test successfully', async () => {
      const labTestId = '1';
      const mockResponse = {
        data: {
          success: true,
          data: { _id: '1', name: 'Blood Test' }
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await labTestService.getById(labTestId);

      expect(api.get).toHaveBeenCalledWith(`/labtests/${labTestId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle 404 error', async () => {
      const mockError = {
        response: {
          data: { success: false, message: 'Lab test not found' }
        }
      };

      api.get.mockRejectedValue(mockError);

      await expect(labTestService.getById('invalid-id')).rejects.toEqual(mockError.response.data);
    });
  });

  describe('create', () => {
    test('should create lab test successfully', async () => {
      const labTestData = { name: 'New Test' };
      const mockResponse = {
        data: {
          success: true,
          message: 'Lab test created successfully',
          data: { _id: '1', name: 'New Test' }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await labTestService.create(labTestData);

      expect(api.post).toHaveBeenCalledWith('/labtests', labTestData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle validation error', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Validation failed',
            errors: [{ msg: 'Name is required' }]
          }
        }
      };

      api.post.mockRejectedValue(mockError);

      await expect(labTestService.create({})).rejects.toEqual(mockError.response.data);
    });
  });

  describe('update', () => {
    test('should update lab test successfully', async () => {
      const labTestId = '1';
      const updateData = { name: 'Updated Test' };
      const mockResponse = {
        data: {
          success: true,
          message: 'Lab test updated successfully',
          data: { _id: '1', name: 'Updated Test' }
        }
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await labTestService.update(labTestId, updateData);

      expect(api.put).toHaveBeenCalledWith(`/labtests/${labTestId}`, updateData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle duplicate name error', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Lab test with this name already exists'
          }
        }
      };

      api.put.mockRejectedValue(mockError);

      await expect(labTestService.update('1', { name: 'Duplicate' })).rejects.toEqual(mockError.response.data);
    });
  });

  describe('delete', () => {
    test('should delete lab test successfully', async () => {
      const labTestId = '1';
      const mockResponse = {
        data: {
          success: true,
          message: 'Lab test deleted successfully'
        }
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await labTestService.delete(labTestId);

      expect(api.delete).toHaveBeenCalledWith(`/labtests/${labTestId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle dependency error', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Cannot delete lab test. It is being used in test data entries.'
          }
        }
      };

      api.delete.mockRejectedValue(mockError);

      await expect(labTestService.delete('1')).rejects.toEqual(mockError.response.data);
    });
  });
});