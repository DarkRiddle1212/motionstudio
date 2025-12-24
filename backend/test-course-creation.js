const axios = require('axios');

async function testCourseCreation() {
  try {
    // Login as instructor
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'instructor@example.com',
      password: 'TestPass123'
    });

    const token = loginResponse.data.token;
    console.log('Logged in successfully, got token');

    // Create a test course
    const courseData = {
      title: 'Introduction to Motion Design',
      description: 'Learn the fundamentals of motion design with After Effects and Cinema 4D',
      duration: '4 weeks',
      pricing: 0, // Free course
      curriculum: 'Week 1: Basics of Animation\nWeek 2: Typography Animation\nWeek 3: 3D Motion Graphics\nWeek 4: Final Project',
      introVideoUrl: 'https://example.com/intro-video.mp4',
      thumbnailUrl: 'https://example.com/thumbnail.jpg'
    };

    const createResponse = await axios.post('http://localhost:5000/api/courses', courseData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Course created successfully:', createResponse.data.course);

    // Publish the course
    const courseId = createResponse.data.course.id;
    const publishResponse = await axios.put(`http://localhost:5000/api/courses/${courseId}`, {
      isPublished: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Course published successfully:', publishResponse.data.course);

    // Get all courses (public endpoint)
    const coursesResponse = await axios.get('http://localhost:5000/api/courses');
    console.log('All published courses:', coursesResponse.data.courses);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testCourseCreation();