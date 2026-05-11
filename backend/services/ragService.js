const { pipeline } = require('@xenova/transformers');
const CourseMaterial = require('../models/CourseMaterial');
const ollama = require('ollama').default;

// Force the correct host
ollama.host = 'http://127.0.0.1:11434';

// Embedding model (runs locally)
let embedder = null;

// Test Ollama connection
const testOllamaConnection = async () => {
  try {
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: 'test' }],
      stream: false
    });
    console.log('✅ Ollama connection successful');
    return true;
  } catch (error) {
    console.error('❌ Ollama connection failed:', error.message);
    return false;
  }
};

// Initialize embedding model
const initEmbedder = async () => {
  if (!embedder) {
    console.log('🔄 Loading embedding model...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded');
  }
  return embedder;
};

// Generate embedding for a text
const generateEmbedding = async (text) => {
  try {
    const model = await initEmbedder();
    const result = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  } catch (error) {
    console.error('Embedding generation error:', error);
    return [];
  }
};

// Search for relevant course materials
const searchRelevantMaterials = async (queryEmbedding, studentId, limit = 5) => {
  try {
    // Get the student to check their batch year
    const Student = require('../models/Student');
    const student = await Student.findById(studentId);

    if (!student) return [];

    // Find materials relevant to this student (by batch year or public)
    const materials = await CourseMaterial.find({
      $or: [
        { targetBatchYears: student.batchYear },
        { targetBatchYears: { $exists: false } },
        { targetBatchYears: null }
      ],
      isActive: true
    });

    if (materials.length === 0) return [];

    // Simple relevance scoring (in production, use vector database)
    const scored = materials.map(material => ({
      ...material.toObject(),
      score: calculateSimilarity(queryEmbedding, material.embedding || [])
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  } catch (error) {
    console.error('Search materials error:', error);
    return [];
  }
};

// Calculate cosine similarity between two vectors
const calculateSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Extract text from material (simplified - in production, parse PDFs)
const extractTextFromMaterial = (material) => {
  return `${material.title}\n${material.description || ''}\nCourse: ${material.courseCode}`;
};

// Main RAG query function
const queryWithRAG = async (studentId, question) => {
  try {
    console.log('🔍 Starting RAG query for student:', studentId);
    console.log('📝 Question:', question);

    // Test Ollama connection first
    const isConnected = await testOllamaConnection();
    if (!isConnected) {
      throw new Error('Ollama server is not reachable. Please make sure Ollama is running.');
    }

    // 1. Generate embedding for the question
    console.log('🔄 Generating embedding for question...');
    const questionEmbedding = await generateEmbedding(question);

    if (!questionEmbedding || questionEmbedding.length === 0) {
      console.log('⚠️ No embedding generated, using fallback response');
      return {
        answer: "I'm having trouble processing your question. Please try again.",
        sources: [],
        hasContext: false
      };
    }

    // 2. Find relevant materials
    console.log('🔎 Searching for relevant materials...');
    const relevantMaterials = await searchRelevantMaterials(questionEmbedding, studentId);
    console.log(`📚 Found ${relevantMaterials.length} relevant materials`);

    // 3. Build context from relevant materials
    let context = '';
    const sources = [];

    for (const material of relevantMaterials) {
      const materialText = extractTextFromMaterial(material);
      if (materialText) {
        context += `\n[${material.title}]: ${materialText.substring(0, 500)}`;
        sources.push(material.title);
      }
    }

    console.log(`📖 Context length: ${context.length} characters`);

    // 4. Create prompt with context
    const prompt = context
      ? `You are an AI academic assistant. Use the following course materials to answer the student's question. If the answer cannot be found in the materials, say "I cannot find that in the provided materials" and provide a general answer.

Course Materials:
${context}

Student Question: ${question}

Answer based on the course materials:`
      : `You are an AI academic assistant. Answer the following question helpfully.

Student Question: ${question}

Answer:`;

    // 5. Get response from Ollama
    console.log('🤖 Sending request to Ollama...');
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });

    console.log('✅ Response received from Ollama');
    return {
      answer: response.message.content,
      sources: sources,
      hasContext: context.length > 0
    };
  } catch (error) {
    console.error('❌ RAG query error:', error);
    throw error;
  }
};

// Simple chat without RAG
const simpleChat = async (question) => {
  try {
    console.log('💬 Simple chat question:', question);

    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: question }],
      stream: false
    });

    return response.message.content;
  } catch (error) {
    console.error('Simple chat error:', error);
    throw error;
  }
};

module.exports = {
  generateEmbedding,
  queryWithRAG,
  initEmbedder,
  testOllamaConnection,
  simpleChat
};