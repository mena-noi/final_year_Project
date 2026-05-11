const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth');   // <-- DELETE this line (or create the file later)

const ollama = require('ollama').default;

router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    // Get the complete response instead of streaming
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [{ role: 'user', content: message }],
      stream: false // Get complete response
    });

    // Send the response content
    const aiResponse = response.message.content;
    res.json({
      message: 'AI response generated successfully',
      response: aiResponse
    });
  } catch (error) {
    console.error('Ollama API Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response.' });
  }
});

module.exports = router;
