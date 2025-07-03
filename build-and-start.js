#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building and starting the application...\n');

try {
  // Check if client directory exists
  const clientPath = path.join(__dirname, 'client');
  if (!fs.existsSync(clientPath)) {
    console.error('❌ Client directory not found!');
    process.exit(1);
  }

  // Install client dependencies if node_modules doesn't exist
  const clientNodeModules = path.join(clientPath, 'node_modules');
  if (!fs.existsSync(clientNodeModules)) {
    console.log('📦 Installing client dependencies...');
    execSync('cd client && npm install', { stdio: 'inherit' });
  }

  // Build the React app
  console.log('🔨 Building React application...');
  execSync('cd client && npm run build', { stdio: 'inherit' });

  // Check if build was successful
  const distPath = path.join(clientPath, 'build');
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build failed! dist folder not found.');
    process.exit(1);
  }

  console.log('✅ Build completed successfully!');
  console.log('🚀 Starting production server...\n');

  // Set production environment and start server
  process.env.NODE_ENV = 'production';
  execSync('node server/index.js', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 