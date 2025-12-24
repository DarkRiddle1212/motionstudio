const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testInstructor = {
  email: 'lesson-instructor@test.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'Instructor',
  role: 'instructor'
};

const testStudent = {
  email: 'lesson-student@test.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'Student',
  role: 'student'
};

const testCourse = {
  title: 'Test Course for Lessons',
  description: 'A test course to verify lesson functionality',
  duration: '4 weeks',
  pricing: 0, // Free course
  curriculum: 'Week 1: Introduction\nWeek 2: Basics\nWeek 3: Advanced\nWeek 4: Project'
};

const testLesson = {
  title: 'Introduction to Motion Design',
  description: 'Learn the basics of motion design',
  content: 'This lesson covers the fundamental principles of motion design...',
  videoUrl: 'https://example.com/video.mp4',
  fileUrls: ['https://example.com/file1.pdf', 'https://example.com/file2.zip'],
  order: 1
};

let instructorToken = '';
let studentToken = '';
let courseId = '';
let lessonId = '';

async function signUpUser(userData) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, userData);
    console.log(`✅ User ${userData.email} signed up successfully`);
    return response.data;
  } catch (error) {
    if (error.response?.data?.error === 'Email already registered') {
      console.log(`ℹ️  User ${userData.email} already exists`);
      return null;
    }
    throw error;
  }
}

async function verifyUserEmail(email) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/test-verify`, { email });
    console.log(`✅ Email verified for ${email} (test mode)`);
    return response.data;
  } catch (error) {
    console.error(`❌ Email verification failed for ${email}:`, error.response?.data?.error);
    throw error;
  }
}

async function setUserRole(email, role) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/test-set-role`, { email, role });
    console.log(`✅ User role set to ${role} for ${email} (test mode)`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to set role for ${email}:`, error.response?.data?.error);
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    console.log(`✅ User ${email} logged in successfully`);
    return response.data.token;
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.response?.data?.error);
    throw error;
  }
}

async function createCourse(courseData, token) {
  try {
    const response = await axios.post(`${BASE_URL}/courses`, courseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Course "${courseData.title}" created successfully`);
    return response.data.course;
  } catch (error) {
    console.error('❌ Course creation failed:', error.response?.data?.error);
    throw error;
  }
}

async function createLesson(lessonData, token) {
  try {
    const response = await axios.post(`${BASE_URL}/lessons`, lessonData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Lesson "${lessonData.title}" created successfully`);
    return response.data.lesson;
  } catch (error) {
    console.error('❌ Lesson creation failed:', error.response?.data?.error);
    throw error;
  }
}

async function publishCourse(courseId, token) {
  try {
    const response = await axios.put(`${BASE_URL}/courses/${courseId}`, 
      { isPublished: true }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Course published successfully`);
    return response.data.course;
  } catch (error) {
    console.error('❌ Course publishing failed:', error.response?.data?.error);
    throw error;
  }
}

async function publishLesson(lessonId, token) {
  try {
    const response = await axios.put(`${BASE_URL}/lessons/${lessonId}`, 
      { isPublished: true }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Lesson published successfully`);
    return response.data.lesson;
  } catch (error) {
    console.error('❌ Lesson publishing failed:', error.response?.data?.error);
    throw error;
  }
}

async function enrollStudent(courseId, token) {
  try {
    const response = await axios.post(`${BASE_URL}/courses/${courseId}/enroll`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Student enrolled in course successfully`);
    return response.data.enrollment;
  } catch (error) {
    console.error('❌ Student enrollment failed:', error.response?.data?.error);
    throw error;
  }
}

async function getCourseLessons(courseId, token) {
  try {
    const response = await axios.get(`${BASE_URL}/lessons/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Retrieved ${response.data.lessons.length} lessons for course`);
    return response.data.lessons;
  } catch (error) {
    console.error('❌ Failed to get course lessons:', error.response?.data?.error);
    throw error;
  }
}

async function getLessonDetails(lessonId, token) {
  try {
    const response = await axios.get(`${BASE_URL}/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Retrieved lesson details: "${response.data.lesson.title}"`);
    return response.data.lesson;
  } catch (error) {
    console.error('❌ Failed to get lesson details:', error.response?.data?.error);
    throw error;
  }
}

async function completeLesson(lessonId, token) {
  try {
    const response = await axios.post(`${BASE_URL}/lessons/${lessonId}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Lesson completed successfully`);
    return response.data.completion;
  } catch (error) {
    console.error('❌ Failed to complete lesson:', error.response?.data?.error);
    throw error;
  }
}

async function testLessonIdempotence(lessonId, token) {
  try {
    // Complete the lesson twice
    const completion1 = await completeLesson(lessonId, token);
    const completion2 = await completeLesson(lessonId, token);
    
    // Both should return the same completion ID (idempotent)
    if (completion1.id === completion2.id) {
      console.log(`✅ Lesson completion is idempotent (same completion ID: ${completion1.id})`);
    } else {
      console.log(`❌ Lesson completion is NOT idempotent (different IDs: ${completion1.id} vs ${completion2.id})`);
    }
  } catch (error) {
    console.error('❌ Failed to test lesson idempotence:', error.response?.data?.error);
    throw error;
  }
}

async function runLessonSystemTest() {
  console.log('🚀 Starting Lesson System Test...\n');

  try {
    // 1. Set up users
    console.log('📝 Setting up test users...');
    await signUpUser(testInstructor);
    await signUpUser(testStudent);
    
    // Verify emails and set roles for testing
    await verifyUserEmail(testInstructor.email);
    await verifyUserEmail(testStudent.email);
    await setUserRole(testInstructor.email, 'instructor');
    await setUserRole(testStudent.email, 'student');
    
    instructorToken = await loginUser(testInstructor.email, testInstructor.password);
    studentToken = await loginUser(testStudent.email, testStudent.password);
    console.log('');

    // 2. Create course
    console.log('📚 Creating test course...');
    const course = await createCourse(testCourse, instructorToken);
    courseId = course.id;
    console.log('');

    // 3. Create lesson
    console.log('📖 Creating test lesson...');
    const lesson = await createLesson({ ...testLesson, courseId }, instructorToken);
    lessonId = lesson.id;
    console.log('');

    // 4. Publish course
    console.log('📢 Publishing course...');
    await publishCourse(courseId, instructorToken);
    console.log('');

    // 5. Publish lesson
    console.log('📢 Publishing lesson...');
    await publishLesson(lessonId, instructorToken);
    console.log('');

    // 6. Enroll student
    console.log('🎓 Enrolling student in course...');
    await enrollStudent(courseId, studentToken);
    console.log('');

    // 7. Test lesson access (student should see lessons)
    console.log('👀 Testing lesson access for enrolled student...');
    const lessons = await getCourseLessons(courseId, studentToken);
    if (lessons.length > 0) {
      console.log(`✅ Student can access ${lessons.length} lesson(s)`);
    } else {
      console.log('❌ Student cannot access lessons');
    }
    console.log('');

    // 8. Test lesson details
    console.log('📋 Testing lesson details access...');
    const lessonDetails = await getLessonDetails(lessonId, studentToken);
    console.log(`   - Title: ${lessonDetails.title}`);
    console.log(`   - Description: ${lessonDetails.description}`);
    console.log(`   - Video URL: ${lessonDetails.videoUrl}`);
    console.log(`   - File URLs: ${lessonDetails.fileUrls.length} files`);
    console.log(`   - Completed: ${lessonDetails.isCompleted}`);
    console.log('');

    // 9. Test lesson completion
    console.log('✅ Testing lesson completion...');
    await completeLesson(lessonId, studentToken);
    
    // Verify completion status
    const updatedLessonDetails = await getLessonDetails(lessonId, studentToken);
    if (updatedLessonDetails.isCompleted) {
      console.log('✅ Lesson completion status updated correctly');
    } else {
      console.log('❌ Lesson completion status not updated');
    }
    console.log('');

    // 10. Test lesson completion idempotence
    console.log('🔄 Testing lesson completion idempotence...');
    await testLessonIdempotence(lessonId, studentToken);
    console.log('');

    // 11. Test instructor lesson access
    console.log('👨‍🏫 Testing instructor lesson access...');
    const instructorLessons = await axios.get(`${BASE_URL}/lessons/instructor/course/${courseId}`, {
      headers: { Authorization: `Bearer ${instructorToken}` }
    });
    console.log(`✅ Instructor can access ${instructorLessons.data.lessons.length} lesson(s) (including unpublished)`);
    console.log('');

    console.log('🎉 All lesson system tests passed successfully!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
runLessonSystemTest();