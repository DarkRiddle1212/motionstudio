#!/usr/bin/env node

/**
 * Debug script for Motion Studio loading issues
 * Run this when the website is stuck in loading state
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Motion Studio Loading Diagnostics\n');

// Check if backend is running
function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5001/api/health', { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Backend is running on port 5001');
        console.log(`   Response: ${data}`);
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Backend is NOT running on port 5001');
      console.log(`   Error: ${err.message}`);
      console.log('   💡 Run: cd backend && npm run dev');
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('⏰ Backend health check timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Check frontend environment
function checkFrontendEnv() {
  const envPath = path.join(__dirname, 'frontend', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Frontend .env file missing');
    console.log('   💡 Create frontend/.env with: VITE_API_URL=http://localhost:5001/api');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiUrl = envContent.match(/VITE_API_URL=(.+)/);
  
  if (!apiUrl) {
    console.log('❌ VITE_API_URL not found in frontend/.env');
    return false;
  }
  
  console.log('✅ Frontend environment configured');
  console.log(`   API URL: ${apiUrl[1]}`);
  return true;
}

// Check for common issues
function checkCommonIssues() {
  console.log('\n🔧 Common Loading Issues:');
  
  // Check localStorage
  console.log('   • Clear browser localStorage if auth is stuck');
  console.log('   • Clear browser cache and service worker');
  console.log('   • Check browser console for JavaScript errors');
  console.log('   • Verify both frontend and backend are running');
  
  // Check ports
  console.log('\n📡 Expected Services:');
  console.log('   • Backend: http://localhost:5001');
  console.log('   • Frontend: http://localhost:3000 or http://localhost:3001');
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('Starting diagnostics...\n');
  
  const backendOk = await checkBackend();
  const frontendEnvOk = checkFrontendEnv();
  
  console.log('\n📊 Summary:');
  console.log(`   Backend: ${backendOk ? '✅ OK' : '❌ ISSUE'}`);
  console.log(`   Frontend Config: ${frontendEnvOk ? '✅ OK' : '❌ ISSUE'}`);
  
  if (backendOk && frontendEnvOk) {
    console.log('\n🎉 All systems appear to be working!');
    console.log('   If still having issues, check browser console for errors.');
  } else {
    console.log('\n⚠️  Issues detected. Please fix the above problems.');
  }
  
  checkCommonIssues();
}

// Run diagnostics
runDiagnostics().catch(console.error);