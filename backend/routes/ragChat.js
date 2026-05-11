const express = require('express');
const router = express.Router();
const { queryWithRAG, testOllamaConnection, simpleChat } = require('../services/ragService');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Test Ollama connection endpoint
router.get('/test', async (req, res) => {
  const isConnected = await testOllamaConnection();
  res.json({
    ollama_running: isConnected,
    message: isConnected ? 'Ollama is running' : 'Ollama is not reachable'
  });
});

// RAG-powered chat (student only)
router.post('/ask', authMiddleware, roleMiddleware(['student']), async (req, res) => {
  try {
    const { question } = req.body;
    const studentId = req.user.id;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await queryWithRAG(studentId, question);

    res.json({
      answer: result.answer,
      sources: result.sources,
      usedContext: result.hasContext
    });
  } catch (error) {
    console.error('RAG chat error:', error);
    res.status(500).json({ error: 'Failed to generate response: ' + error.message });
  }
});

// Simple chat without RAG (for testing)
router.post('/chat', authMiddleware, roleMiddleware(['student']), async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await simpleChat(question);
    res.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response: ' + error.message });
  }
});

module.exports = router;