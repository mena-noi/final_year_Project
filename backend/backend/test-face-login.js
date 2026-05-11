// Simple test script for face recognition login
const fetch = require('node-fetch');

async function testFaceLogin() {
  try {
    // Get all enrolled users to see their face descriptors
    const usersResponse = await fetch('http://localhost:3000/api/auth/debug/faces');
    const usersData = await usersResponse.json();
    
    console.log('Enrolled users:', usersData);
    
    if (usersData.users.length > 0) {
      // Use the first user's face descriptor to test login
      const firstUser = usersData.users[0];
      
      // Get the actual face descriptor from database
      const authResponse = await fetch('http://localhost:3000/api/auth/users');
      const authData = await authResponse.json();
      
      const userWithFace = authData.find(u => u.email === firstUser.email);
      
      if (userWithFace && userWithFace.faceDescriptor) {
        console.log('Testing face login with:', firstUser.name);
        
        // Test login with the same face descriptor
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            faceDescriptor: userWithFace.faceDescriptor
          })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
          console.log('✅ Face login successful!');
          console.log('User:', loginData.user.name);
          console.log('Confidence:', loginData.confidence);
          console.log('Distance:', loginData.distance);
        } else {
          console.log('❌ Face login failed:', loginData.error);
        }
      } else {
        console.log('❌ No face descriptor found for user');
      }
    } else {
      console.log('❌ No enrolled users found');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testFaceLogin();
