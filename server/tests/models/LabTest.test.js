const mongoose = require('mongoose');
const LabTest = require('../../models/LabTest');
const dbSetup = require('../setup/database');

describe('LabTest Model', () => {
  beforeAll(async () => {
    await dbSetup.connect();
  });

  afterEach(async () => {
    await dbSetup.clearDatabase();
  });

  afterAll(async () => {
    await dbSetup.closeDatabase();
  });

  describe('Schema Validation', () => {
    test('should create a valid lab test', async () => {
      const labTestData = {
        name: 'Blood Test'
      };

      const labTest = new LabTest(labTestData);
      const savedLabTest = await labTest.save();

      expect(savedLabTest._id).toBeDefined();
      expect(savedLabTest.name).toBe(labTestData.name);
      expect(savedLabTest.createdAt).toBeDefined();
      expect(savedLabTest.updatedAt).toBeDefined();
    });

    test('should fail validation when name is missing', async () => {
      const labTest = new LabTest({});

      let error;
      try {
        await labTest.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toBe('Lab test name is required');
    });

    test('should fail validation when name is too short', async () => {
      const labTest = new LabTest({ name: 'A' });

      let error;
      try {
        await labTest.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toBe('Lab test name must be at least 2 characters long');
    });

    test('should fail validation when name is too long', async () => {
      const longName = 'A'.repeat(101);
      const labTest = new LabTest({ name: longName });

      let error;
      try {
        await labTest.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toBe('Lab test name cannot exceed 100 characters');
    });

    test('should trim whitespace from name', async () => {
      const labTest = new LabTest({ name: '  Blood Test  ' });
      const savedLabTest = await labTest.save();

      expect(savedLabTest.name).toBe('Blood Test');
    });
  });

  describe('Uniqueness Constraints', () => {
    test('should enforce unique name constraint', async () => {
      const labTest1 = new LabTest({ name: 'Blood Test' });
      await labTest1.save();

      const labTest2 = new LabTest({ name: 'Blood Test' });

      let error;
      try {
        await labTest2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
    });

    test('should allow different names', async () => {
      const labTest1 = new LabTest({ name: 'Blood Test' });
      const labTest2 = new LabTest({ name: 'Urine Test' });

      const saved1 = await labTest1.save();
      const saved2 = await labTest2.save();

      expect(saved1._id).toBeDefined();
      expect(saved2._id).toBeDefined();
      expect(saved1.name).toBe('Blood Test');
      expect(saved2.name).toBe('Urine Test');
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt', async () => {
      const labTest = new LabTest({ name: 'Blood Test' });
      const savedLabTest = await labTest.save();

      expect(savedLabTest.createdAt).toBeDefined();
      expect(savedLabTest.updatedAt).toBeDefined();
      expect(savedLabTest.createdAt).toEqual(savedLabTest.updatedAt);
    });

    test('should update updatedAt when modified', async () => {
      const labTest = new LabTest({ name: 'Blood Test' });
      const savedLabTest = await labTest.save();
      const originalUpdatedAt = savedLabTest.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedLabTest.name = 'Updated Blood Test';
      const updatedLabTest = await savedLabTest.save();

      expect(updatedLabTest.updatedAt).not.toEqual(originalUpdatedAt);
      expect(updatedLabTest.updatedAt > originalUpdatedAt).toBe(true);
    });
  });

  describe('Index Tests', () => {
    test('should have name index for faster queries', async () => {
      const indexes = await LabTest.collection.getIndexes();
      
      expect(indexes).toHaveProperty('name_1');
    });
  });
});