#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

console.log('🚀 Setting up Initial Dashboard Application...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please update the .env file with your MongoDB connection string and JWT secret.\n');
  } else {
    console.log('❌ env.example file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if client .env file exists
if (!fs.existsSync('client/.env')) {
  console.log('📝 Creating client .env file...');
  const clientEnvContent = `# Frontend Configuration
REACT_APP_API_URL=${process.env.REACT_APP_API_URL}
REACT_APP_NAME=${process.env.REACT_APP_NAME}`;
  
  fs.writeFileSync('client/.env', clientEnvContent);
  console.log('✅ Client .env file created successfully!\n');
} else {
  console.log('✅ Client .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed successfully!\n');
} catch (error) {
  console.log('❌ Failed to install root dependencies.');
  process.exit(1);
}

// Install client dependencies
console.log('📦 Installing client dependencies...');
try {
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Client dependencies installed successfully!\n');
} catch (error) {
  console.log('❌ Failed to install client dependencies.');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update the .env file with your MongoDB connection string');
console.log('2. Set a secure JWT_SECRET in the .env file');
console.log('3. Run "npm run dev" to start the development servers');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📚 For more information, check the README.md file.'); 