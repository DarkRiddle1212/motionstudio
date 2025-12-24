const axios = require('axios');

async function testEnrollment() {
  try {
    // Login as the student we created earlier
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'student@example.com',
      password: 'TestPass123'
    });

    const token = loginResponse.data.token;
    console.log('Logged in as student successfully');

    // Get the course ID from the courses list
    const coursesResponse = await axios.get('http://localhost:5000/api/courses');
    const courseId = coursesResponse.data.courses[0].id;
    console.log('Found course ID:', courseId);

    // Enroll in the course
    const enrollResponse = await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Enrollment successful:', enrollResponse.data.enrollment);

    // Get student's enrolled courses
    const enrollmentsResponse = await axios.get('http://localhost:5000/api/students/courses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Student enrollments:', enrollmentsResponse.data.enrollments);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testEnrollment();