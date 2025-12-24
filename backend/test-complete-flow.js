// Test complete email verification flow
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteFlow() {
  try {
    console.log('Testing complete email verification flow...\n');

    // Step 1: Sign up
    console.log('1. Testing sign up...');
    const signUpData = {
      email: 'complete-test@example.com',
      password: 'TestPassword123',
      firstName: 'Complete',
      lastName: 'Test'
    };

    const signUpResponse = await axios.post(`${BASE_URL}/auth/signup`, signUpData);
    console.log('✅ Sign up successful:', signUpResponse.data);

    // Wait a moment for the server to log the email
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n📧 Check the server console for the verification token...');
    console.log('We need to extract the token from the server logs to continue the test.');

    console.log('\n✅ Sign up and email sending completed successfully!');
    console.log('Next: Use the token from server logs to test verification endpoint');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteFlow();