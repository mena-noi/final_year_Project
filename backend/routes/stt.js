const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

router.post('/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });

    const tempPath = path.join(__dirname, '../temp', Date.now() + '.wav');

    try {
        await writeFile(tempPath, req.file.buffer);

        const language = req.body.language || 'amh'; // default to amh
        const pythonScript = path.join(__dirname, '../scripts/simba_transcribe.py');

        exec(`python "${pythonScript}" "${tempPath}" "${language}"`, async (error, stdout, stderr) => {
            await unlink(tempPath).catch(console.error);

            if (error) {
                console.error('Simba error:', stderr);
                return res.status(500).json({ error: 'Transcription failed' });
            }

            res.json({ transcription: stdout.trim() });
        });
    } catch (err) {
        await unlink(tempPath).catch(console.error);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;