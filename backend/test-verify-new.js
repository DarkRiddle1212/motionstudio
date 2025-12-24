// Test email verification with new token
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testVerification() {
  try {
    console.log('Testing email verification with new token...\n');

    // Use the token from the server log
    const token = '9v9gkeih1vne0softs7iw4';

    console.log('1. Testing email verification...');
    const verifyResponse = await axios.post(`${BASE_URL}/auth/verify-email`, {
      token: token
    });
    console.log('✅ Email verification successful:', verifyResponse.data);

    // Now test login with the verified account
    console.log('\n2. Testing login with verified account...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'complete-test@example.com',
      password: 'TestPassword123'
    });
    console.log('✅ Login successful:', loginResponse.data);

    console.log('\n✅ Complete email verification flow working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testVerification();