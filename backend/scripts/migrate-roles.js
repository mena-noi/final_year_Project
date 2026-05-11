const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrateRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users without a role field
    const usersWithoutRole = await User.find({ role: { $exists: false } });
    
    console.log(`Found ${usersWithoutRole.length} users without role field`);

    // Update all existing users to have 'student' role by default
    const updateResult = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'student' } }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} users to 'student' role`);

    // Show updated users
    const updatedUsers = await User.find({});
    console.log('\n📋 Current users:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role || 'undefined'}`);
    });

  } catch (error) {
    console.error('Error migrating roles:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateRoles();
