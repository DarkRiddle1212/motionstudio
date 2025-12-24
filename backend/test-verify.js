// Test email verification endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testVerification() {
  try {
    console.log('Testing email verification endpoint...\n');

    // Use the token from the server log
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiZW1haWxfdmVyaWZpY2F0aW9uIiwiaWF0IjoxNzM0NDQ5NzMyLCJleHAiOjE3MzQ1MzYxMzJ9.J9-H6Qkfd03BVfLNdXYxFwkWVHKRY1_x8FjjvXbRLyY';

    console.log('1. Testing email verification...');
    const verifyResponse = await axios.post(`${BASE_URL}/auth/verify-email`, {
      token: token
    });
    console.log('✅ Email verification successful:', verifyResponse.data);

    // Now test login with the verified account
    console.log('\n2. Testing login with verified account...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test-email@example.com',
      password: 'TestPassword123'
    });
    console.log('✅ Login successful:', loginResponse.data);

    console.log('\n✅ Email verification flow completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testVerification();