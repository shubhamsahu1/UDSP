import { testDataService } from '../testDataService';
import api from '../api';

// Mock the api module
jest.mock('../api');

describe('testDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLabTests', () => {
    test('should fetch lab tests for dropdown successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            { _id: '1', name: 'Blood Test' },
            { _id: '2', name: 'Urine Test' }
          ]
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await testDataService.getLabTests();

      expect(api.get).toHaveBeenCalledWith('/testdata/labtests');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle API error', async () => {
      const mockError = {
        response: {
          data: { success: false, message: 'Server error' }
        }
      };

      api.get.mockRejectedValue(mockError);

      await expect(testDataService.getLabTests()).rejects.toEqual(mockError.response.data);
    });
  });

  describe('getMyDataByDate', () => {
    test('should fetch user test data for specific date', async () => {
      const testDate = '2023-12-01';
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              _id: '1',
              userId: 'user1',
              date: testDate,
              labTestId: { _id: 'lab1', name: 'Blood Test' },
              sampleTaken: 100,
              samplePositive: 5
            }
          ]
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await testDataService.getMyDataByDate(testDate);

      expect(api.get).toHaveBeenCalledWith(`/testdata/my/${testDate}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle no data found', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: []
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await testDataService.getMyDataByDate('2023-12-01');

      expect(result.data).toEqual([]);
    });
  });

  describe('saveTestData', () => {
    test('should save test data successfully', async () => {
      const testData = {
        date: '2023-12-01',
        labTestId: 'lab1',
        sampleTaken: 100,
        samplePositive: 5
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Test data created successfully',
          data: {
            _id: '1',
            ...testData,
            userId: 'user1'
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await testDataService.saveTestData(testData);

      expect(api.post).toHaveBeenCalledWith('/testdata', testData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle validation error', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Validation failed',
            errors: [{ msg: 'Date is required' }]
          }
        }
      };

      api.post.mockRejectedValue(mockError);

      await expect(testDataService.saveTestData({})).rejects.toEqual(mockError.response.data);
    });

    test('should handle business logic error', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Number of positive samples cannot exceed number of samples taken'
          }
        }
      };

      api.post.mockRejectedValue(mockError);

      const invalidData = {
        date: '2023-12-01',
        labTestId: 'lab1',
        sampleTaken: 5,
        samplePositive: 10
      };

      await expect(testDataService.saveTestData(invalidData)).rejects.toEqual(mockError.response.data);
    });
  });

  describe('updateTestData', () => {
    test('should update test data successfully', async () => {
      const testDataId = '1';
      const updateData = {
        date: '2023-12-01',
        labTestId: 'lab1',
        sampleTaken: 150,
        samplePositive: 10
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Test data updated successfully',
          data: {
            _id: testDataId,
            ...updateData,
            userId: 'user1'
          }
        }
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await testDataService.updateTestData(testDataId, updateData);

      expect(api.put).toHaveBeenCalledWith(`/testdata/${testDataId}`, updateData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle not found error', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Test data entry not found'
          }
        }
      };

      api.put.mockRejectedValue(mockError);

      await expect(testDataService.updateTestData('invalid-id', {})).rejects.toEqual(mockError.response.data);
    });
  });

  describe('deleteTestData', () => {
    test('should delete test data successfully', async () => {
      const testDataId = '1';
      const mockResponse = {
        data: {
          success: true,
          message: 'Test data entry deleted successfully'
        }
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await testDataService.deleteTestData(testDataId);

      expect(api.delete).toHaveBeenCalledWith(`/testdata/${testDataId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle authorization error', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Test data entry not found'
          }
        }
      };

      api.delete.mockRejectedValue(mockError);

      await expect(testDataService.deleteTestData('other-user-data')).rejects.toEqual(mockError.response.data);
    });
  });

  describe('Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      api.get.mockRejectedValue(networkError);

      await expect(testDataService.getLabTests()).rejects.toEqual({
        success: false,
        message: 'Network error'
      });
    });

    test('should handle malformed response', async () => {
      const mockResponse = { data: null };
      api.get.mockResolvedValue(mockResponse);

      const result = await testDataService.getLabTests();
      expect(result).toBeNull();
    });
  });
});