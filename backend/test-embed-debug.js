require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const { generateEmbedding, testOllamaConnection } = require('./services/ragService');

// Use MONGODB_URI or MONGO_URI
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/avb';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const CourseMaterial = require('./models/CourseMaterial');
    const { generateEmbedding } = require('./services/ragService');

    const materials = await CourseMaterial.find({ embedding: { $exists: false } });
    console.log(`Found ${materials.length} materials without embeddings.`);
    
    let count = 0;
    for (const material of materials) {
      console.log(`Generating for: ${material.title}`);
      const text = `${material.title} ${material.description || ''} ${material.courseCode}`;
      const embedding = await generateEmbedding(text);
      if (embedding && embedding.length > 0) {
        material.embedding = embedding;
        await material.save();
        console.log(`✅ Saved embedding for ${material.title}`);
        count++;
      } else {
        console.log(`❌ Failed to generate embedding for ${material.title}`);
      }
    }
    console.log(`Successfully generated embeddings for ${count} materials.`);

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
