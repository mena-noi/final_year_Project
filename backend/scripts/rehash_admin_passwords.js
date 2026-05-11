// rehash_admin_passwords.js - one‑off script to hash legacy admin passwords

/**
 * Run with: `node backend/scripts/rehash_admin_passwords.js`
 *
 * The script connects to the project's MongoDB, scans the Lecturer and DepartmentHead
 * collections for records whose `password` field does NOT start with a bcrypt hash prefix
 * (`$2a$`, `$2b$`, `$2y$`). For each such record it generates a salt (10 rounds),
 * hashes the existing plaintext password, saves the document, and logs the action.
 *
 * WARNING: This will overwrite the stored passwords. Make sure you have a backup
 * or are comfortable resetting passwords for affected accounts.
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Lecturer, DepartmentHead } = require('../models/Admin');

// Mongo connection string – use the same as your server (env var or default)
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/avb';

// Helper to test whether a string looks like a bcrypt hash
function isBcryptHash(str) {
  return typeof str === 'string' && /^\$2[aby]\$\d{2}\$/.test(str);
}

async function rehashModel(Model, label) {
  const users = await Model.find({});
  let count = 0;
  for (const user of users) {
    if (!isBcryptHash(user.password)) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        await Model.updateOne({ _id: user._id }, { $set: { password: hash } });
        console.log(`✅ Re‑hashed ${label}: ${user.email}`);
        count++;
      } catch (e) {
        console.error(`❌ Error re‑hashing ${label} (${user.email}):`, e);
      }
    }
  }
  return count;
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    const lecturerCount = await rehashModel(Lecturer, 'Lecturer');
    const headCount = await rehashModel(DepartmentHead, 'DepartmentHead');

    console.log('\nSummary:');
    console.log(`  Lecturers re‑hashed: ${lecturerCount}`);
    console.log(`  Department Heads re‑hashed: ${headCount}`);
    console.log('✅ Done');
  } catch (err) {
    console.error('❌ Fatal error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
