require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const { queryWithRAG } = require('./services/ragService');
const Student = require('./models/Student');
const CourseMaterial = require('./models/CourseMaterial');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/avb';

async function testRAG() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Check Student
    const student = await Student.findOne();
    if (!student) {
      console.log('❌ No student found in DB to use for testing!');
      return;
    }
    console.log(`Using student: ${student.email} (ID: ${student._id}, Batch Year: ${student.batchYear})`);

    // 2. Check Course Materials
    const allMaterials = await CourseMaterial.find();
    console.log(`Total course materials: ${allMaterials.length}`);
    allMaterials.forEach(m => {
      console.log(`- Material: ${m.title}, targetBatchYears: ${JSON.stringify(m.targetBatchYears)}, hasEmbedding: ${m.embedding && m.embedding.length > 0}`);
    });

    // 3. Test RAG Query
    console.log('\n--- Running RAG Query ---');
    const question = 'What is stated on slide 13 according to the algorithms notes?';
    
    const result = await queryWithRAG(student._id, question);
    console.log('\n✅ Result:');
    console.log(`Answer: ${result.answer}`);
    console.log(`Sources: ${result.sources.join(', ')}`);
    console.log(`Has Context: ${result.hasContext}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testRAG();
