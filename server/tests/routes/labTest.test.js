const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const LabTest = require('../../models/LabTest');
const TestData = require('../../models/TestData');
const User = require('../../models/User');
const dbSetup = require('../setup/database');
const labTestRoutes = require('../../routes/labTest');
const { auth, adminAuth } = require('../../middleware/auth');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/labtests', labTestRoutes);

// Set JWT secret for testing
process.env.JWT_SECRET = 'test-secret-key';

describe('LabTest Routes', () => {
  let adminUser, staffUser, adminToken, staffToken;

  beforeAll(async () => {
    await dbSetup.connect();
  });

  beforeEach(async () => {
    // Create test users
    adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      mobile: '1234567890',
      role: 'admin'
    });
    await adminUser.save();

    staffUser = new User({
      username: 'staff',
      email: 'staff@example.com',
      password: 'password123',
      firstName: 'Staff',
      lastName: 'User',
      mobile: '0987654321',
      role: 'staff'
    });
    await staffUser.save();

    // Generate tokens
    adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);
    staffToken = jwt.sign({ userId: staffUser._id }, process.env.JWT_SECRET);
  });

  afterEach(async () => {
    await dbSetup.clearDatabase();
  });

  afterAll(async () => {
    await dbSetup.closeDatabase();
  });

  describe('GET /api/labtests', () => {
    beforeEach(async () => {
      // Create some test lab tests
      await LabTest.create([
        { name: 'Blood Test' },
        { name: 'Urine Test' },
        { name: 'Stool Test' }
      ]);
    });

    test('should get all lab tests for admin user', async () => {
      const response = await request(app)
        .get('/api/labtests')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
      expect(response.body.data[0].name).toBe('Blood Test'); // Sorted by name
    });

    test('should deny access for staff user', async () => {
      const response = await request(app)
        .get('/api/labtests')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Admin role required.');
    });

    test('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/labtests')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/labtests')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token.');
    });
  });

  describe('GET /api/labtests/:id', () => {
    let labTest;

    beforeEach(async () => {
      labTest = await LabTest.create({ name: 'Blood Test' });
    });

    test('should get single lab test for admin user', async () => {
      const response = await request(app)
        .get(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Blood Test');
      expect(response.body.data._id).toBe(labTest._id.toString());
    });

    test('should return 404 for non-existent lab test', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/labtests/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lab test not found');
    });

    test('should return 404 for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/api/labtests/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lab test not found');
    });

    test('should deny access for staff user', async () => {
      const response = await request(app)
        .get(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/labtests', () => {
    test('should create new lab test for admin user', async () => {
      const newLabTest = { name: 'New Blood Test' };

      const response = await request(app)
        .post('/api/labtests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newLabTest)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Lab test created successfully');
      expect(response.body.data.name).toBe('New Blood Test');
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    test('should fail validation for empty name', async () => {
      const response = await request(app)
        .post('/api/labtests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    test('should fail validation for missing name', async () => {
      const response = await request(app)
        .post('/api/labtests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    test('should fail for duplicate name', async () => {
      await LabTest.create({ name: 'Blood Test' });

      const response = await request(app)
        .post('/api/labtests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Blood Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lab test with this name already exists');
    });

    test('should fail for case-insensitive duplicate name', async () => {
      await LabTest.create({ name: 'Blood Test' });

      const response = await request(app)
        .post('/api/labtests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'BLOOD TEST' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lab test with this name already exists');
    });

    test('should deny access for staff user', async () => {
      const response = await request(app)
        .post('/api/labtests')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ name: 'Blood Test' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/labtests/:id', () => {
    let labTest;

    beforeEach(async () => {
      labTest = await LabTest.create({ name: 'Blood Test' });
    });

    test('should update lab test for admin user', async () => {
      const updateData = { name: 'Updated Blood Test' };

      const response = await request(app)
        .put(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Lab test updated successfully');
      expect(response.body.data.name).toBe('Updated Blood Test');
      expect(response.body.data.updatedAt).not.toBe(response.body.data.createdAt);
    });

    test('should return 404 for non-existent lab test', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/labtests/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lab test not found');
    });

    test('should fail for duplicate name with different lab test', async () => {
      await LabTest.create({ name: 'Urine Test' });

      const response = await request(app)
        .put(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Urine Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lab test with this name already exists');
    });

    test('should allow updating with same name', async () => {
      const response = await request(app)
        .put(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Blood Test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should deny access for staff user', async () => {
      const response = await request(app)
        .put(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ name: 'Updated Test' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/labtests/:id', () => {
    let labTest;

    beforeEach(async () => {
      labTest = await LabTest.create({ name: 'Blood Test' });
    });

    test('should delete lab test for admin user', async () => {
      const response = await request(app)
        .delete(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Lab test deleted successfully');

      // Verify deletion
      const deletedLabTest = await LabTest.findById(labTest._id);
      expect(deletedLabTest).toBeNull();
    });

    test('should return 404 for non-existent lab test', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/labtests/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lab test not found');
    });

    test('should prevent deletion if lab test is being used in test data', async () => {
      // Create test data using the lab test
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        mobile: '1111111111',
        role: 'staff'
      });

      await TestData.create({
        userId: user._id,
        date: new Date(),
        labTestId: labTest._id,
        sampleTaken: 10,
        samplePositive: 1
      });

      const response = await request(app)
        .delete(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete lab test. It is being used in');
      expect(response.body.message).toContain('test data entries');

      // Verify lab test still exists
      const existingLabTest = await LabTest.findById(labTest._id);
      expect(existingLabTest).not.toBeNull();
    });

    test('should deny access for staff user', async () => {
      const response = await request(app)
        .delete(`/api/labtests/${labTest._id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle server errors gracefully', async () => {
      // Mock a database error by breaking the connection temporarily
      const originalFind = LabTest.find;
      LabTest.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app)
        .get('/api/labtests')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Server error while fetching lab tests');

      // Restore original method
      LabTest.find = originalFind;
    });
  });
});