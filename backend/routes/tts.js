const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// POST /api/tts/speak
// body: { text: string, lang?: "en" | "am" | "or" }
router.post('/speak', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    const lang = String(req.body?.lang || 'en').toLowerCase();

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const pythonScript = path.join(__dirname, '../scripts/mms_tts.py');

    // Use spawn so we can stream binary audio back.
    const child = spawn('python', [pythonScript, '--lang', lang, '--text', text], {
      windowsHide: true
    });

    const stdoutChunks = [];
    const stderrChunks = [];

    child.stdout.on('data', (chunk) => stdoutChunks.push(chunk));
    child.stderr.on('data', (chunk) => stderrChunks.push(chunk));

    child.on('error', (err) => {
      console.error('TTS spawn error:', err);
      res.status(500).json({ error: 'TTS process failed to start' });
    });

    child.on('close', (code) => {
      const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();
      if (code !== 0) {
        console.error('TTS process failed:', { code, stderr });
        return res.status(500).json({ error: 'TTS failed', details: stderr || undefined });
      }

      const wavBuffer = Buffer.concat(stdoutChunks);
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(wavBuffer);
    });
  } catch (error) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

