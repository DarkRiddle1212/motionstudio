const axios = require('axios');

async function setupStudent() {
  try {
    // Create a new student
    const signupResponse = await axios.post('http://localhost:5000/api/auth/signup', {
      email: 'student@example.com',
      password: 'TestPass123',
      firstName: 'Jane',
      lastName: 'Student'
    });

    console.log('Student created:', signupResponse.data);

    // The verification token will be in the backend logs
    console.log('Check backend logs for verification token, then run the enrollment test');

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

setupStudent();