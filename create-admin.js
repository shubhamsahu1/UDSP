#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./server/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(0);
    }
    
    // Generate a secure random password
    const generateSecurePassword = () => {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*';
      
      const all = uppercase + lowercase + numbers + symbols;
      let password = '';
      
      // Ensure at least one character from each set
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];
      
      // Fill the rest randomly
      for (let i = 4; i < 12; i++) {
        password += all[Math.floor(Math.random() * all.length)];
      }
      
      // Shuffle the password
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };
    
    const adminPassword = generateSecurePassword();
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      mobile: '1234567890',
      role: 'admin',
      isActive: true
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('👤 Username: admin');
    console.log('📧 Email: admin@example.com');
    console.log('📱 Mobile: 1234567890');
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  IMPORTANT: Save this password securely and change it after first login!');
    console.log('🔐 This password contains uppercase, lowercase, numbers, and symbols for security.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the script
createAdminUser(); 