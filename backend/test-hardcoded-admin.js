const axios = require('axios');

async function testHardcodedAdmin() {
  try {
    console.log('Testing hardcoded admin login...');
    
    const response = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'bolaowoade8@gmail.com',
      password: 'bolaowo26'
    });
    
    console.log('✅ Hardcoded admin login successful!');
    console.log('Admin user:', response.data.user);
    console.log('Admin level:', response.data.adminLevel);
    console.log('Session ID:', response.data.sessionId);
    console.log('Token (first 50 chars):', response.data.token.substring(0, 50) + '...');
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Hardcoded admin login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function testAdminEndpoint(token) {
  try {
    console.log('\nTesting admin endpoint access...');
    
    const response = await axios.get('http://localhost:5000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Admin endpoint access successful!');
    console.log('Users count:', response.data.users?.length || 0);
    
  } catch (error) {
    console.error('❌ Admin endpoint access failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting hardcoded admin tests...\n');
  
  const token = await testHardcodedAdmin();
  
  if (token) {
    await testAdminEndpoint(token);
  }
  
  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testHardcodedAdmin, testAdminEndpoint };