const mongoose = require('mongoose');
const TestData = require('../../models/TestData');
const LabTest = require('../../models/LabTest');
const User = require('../../models/User');
const dbSetup = require('../setup/database');

describe('TestData Model', () => {
  let user, labTest;

  beforeAll(async () => {
    await dbSetup.connect();
  });

  beforeEach(async () => {
    // Create test user and lab test
    user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      mobile: '1234567890',
      role: 'staff'
    });
    await user.save();

    labTest = new LabTest({
      name: 'Blood Test'
    });
    await labTest.save();
  });

  afterEach(async () => {
    await dbSetup.clearDatabase();
  });

  afterAll(async () => {
    await dbSetup.closeDatabase();
  });

  describe('Schema Validation', () => {
    test('should create a valid test data entry', async () => {
      const testDataInput = {
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: 100,
        samplePositive: 5
      };

      const testData = new TestData(testDataInput);
      const savedTestData = await testData.save();

      expect(savedTestData._id).toBeDefined();
      expect(savedTestData.userId.toString()).toBe(user._id.toString());
      expect(savedTestData.labTestId.toString()).toBe(labTest._id.toString());
      expect(savedTestData.sampleTaken).toBe(100);
      expect(savedTestData.samplePositive).toBe(5);
      expect(savedTestData.createdAt).toBeDefined();
      expect(savedTestData.updatedAt).toBeDefined();
    });

    test('should fail validation when required fields are missing', async () => {
      const testData = new TestData({});

      let error;
      try {
        await testData.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.date).toBeDefined();
      expect(error.errors.labTestId).toBeDefined();
      expect(error.errors.sampleTaken).toBeDefined();
      expect(error.errors.samplePositive).toBeDefined();
    });

    test('should fail validation when sample counts are negative', async () => {
      const testData = new TestData({
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: -1,
        samplePositive: -1
      });

      let error;
      try {
        await testData.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.sampleTaken).toBeDefined();
      expect(error.errors.samplePositive).toBeDefined();
    });

    test('should fail validation when sample counts are not integers', async () => {
      const testData = new TestData({
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: 10.5,
        samplePositive: 2.3
      });

      let error;
      try {
        await testData.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.sampleTaken).toBeDefined();
      expect(error.errors.samplePositive).toBeDefined();
    });
  });

  describe('Custom Validation', () => {
    test('should fail validation when positive samples exceed taken samples', async () => {
      const testData = new TestData({
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: 5,
        samplePositive: 10 // More positive than taken
      });

      let error;
      try {
        await testData.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('Number of positive samples cannot exceed number of samples taken');
    });

    test('should allow positive samples equal to taken samples', async () => {
      const testData = new TestData({
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: 10,
        samplePositive: 10 // Equal is allowed
      });

      const savedTestData = await testData.save();
      expect(savedTestData._id).toBeDefined();
    });

    test('should allow zero positive samples', async () => {
      const testData = new TestData({
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: 10,
        samplePositive: 0
      });

      const savedTestData = await testData.save();
      expect(savedTestData._id).toBeDefined();
    });
  });

  describe('Unique Constraints', () => {
    test('should enforce unique constraint on user, date, and lab test combination', async () => {
      const testDate = new Date();
      
      const testData1 = new TestData({
        userId: user._id,
        date: testDate,
        labTestId: labTest._id,
        sampleTaken: 10,
        samplePositive: 1
      });
      await testData1.save();

      const testData2 = new TestData({
        userId: user._id,
        date: testDate,
        labTestId: labTest._id,
        sampleTaken: 20,
        samplePositive: 2
      });

      let error;
      try {
        await testData2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
    });

    test('should allow same user and date with different lab tests', async () => {
      const labTest2 = new LabTest({ name: 'Urine Test' });
      await labTest2.save();

      const testDate = new Date();
      
      const testData1 = new TestData({
        userId: user._id,
        date: testDate,
        labTestId: labTest._id,
        sampleTaken: 10,
        samplePositive: 1
      });
      
      const testData2 = new TestData({
        userId: user._id,
        date: testDate,
        labTestId: labTest2._id,
        sampleTaken: 20,
        samplePositive: 2
      });

      const saved1 = await testData1.save();
      const saved2 = await testData2.save();

      expect(saved1._id).toBeDefined();
      expect(saved2._id).toBeDefined();
    });

    test('should allow same lab test and date with different users', async () => {
      const user2 = new User({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
        firstName: 'Test2',
        lastName: 'User2',
        mobile: '0987654321',
        role: 'staff'
      });
      await user2.save();

      const testDate = new Date();
      
      const testData1 = new TestData({
        userId: user._id,
        date: testDate,
        labTestId: labTest._id,
        sampleTaken: 10,
        samplePositive: 1
      });
      
      const testData2 = new TestData({
        userId: user2._id,
        date: testDate,
        labTestId: labTest._id,
        sampleTaken: 20,
        samplePositive: 2
      });

      const saved1 = await testData1.save();
      const saved2 = await testData2.save();

      expect(saved1._id).toBeDefined();
      expect(saved2._id).toBeDefined();
    });
  });

  describe('Population Tests', () => {
    test('should populate user and lab test data', async () => {
      const testData = new TestData({
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: 10,
        samplePositive: 1
      });
      
      const savedTestData = await testData.save();
      const populatedData = await TestData.findById(savedTestData._id)
        .populate('userId', 'firstName lastName username')
        .populate('labTestId', 'name');

      expect(populatedData.userId.firstName).toBe('Test');
      expect(populatedData.userId.lastName).toBe('User');
      expect(populatedData.userId.username).toBe('testuser');
      expect(populatedData.labTestId.name).toBe('Blood Test');
    });
  });

  describe('Index Tests', () => {
    test('should have proper indexes for performance', async () => {
      const indexes = await TestData.collection.getIndexes();
      
      // Check for compound unique index
      expect(indexes).toHaveProperty('userId_1_date_1_labTestId_1');
      
      // Check for date and labTestId index for reporting
      expect(indexes).toHaveProperty('date_1_labTestId_1');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large sample counts', async () => {
      const testData = new TestData({
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: 999999,
        samplePositive: 999999
      });

      const savedTestData = await testData.save();
      expect(savedTestData.sampleTaken).toBe(999999);
      expect(savedTestData.samplePositive).toBe(999999);
    });

    test('should handle date edge cases', async () => {
      const oldDate = new Date('2020-01-01');
      const futureDate = new Date('2030-12-31');

      const testData1 = new TestData({
        userId: user._id,
        date: oldDate,
        labTestId: labTest._id,
        sampleTaken: 10,
        samplePositive: 1
      });

      const testData2 = new TestData({
        userId: user._id,
        date: futureDate,
        labTestId: labTest._id,
        sampleTaken: 20,
        samplePositive: 2
      });

      const saved1 = await testData1.save();
      const saved2 = await testData2.save();

      expect(saved1.date).toEqual(oldDate);
      expect(saved2.date).toEqual(futureDate);
    });
  });
});