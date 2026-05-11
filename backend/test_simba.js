const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const audioFile = process.argv[2];
const language = process.argv[3];

if (!audioFile || !language) {
    console.error('Usage: node test_simba.js <audio_file> <language>');
    console.error('Languages: eng, amh, orm');
    process.exit(1);
}

if (!['eng', 'amh', 'orm'].includes(language)) {
    console.error('Invalid language. Use: eng, amh, orm');
    process.exit(1);
}

if (!fs.existsSync(audioFile)) {
    console.error(`File not found: ${audioFile}`);
    process.exit(1);
}

let pythonScript;
if (language === 'eng') {
    pythonScript = path.join(__dirname, 'scripts', 'whisper_transcribe.py');
    console.log(`🎤 Using Whisper for English`);
} else {
    pythonScript = path.join(__dirname, 'scripts', 'simba_transcribe.py');
    console.log(`🎤 Using Simba-M for ${language === 'amh' ? 'Amharic' : 'Oromo'}`);
}

console.log(`📁 Audio: ${audioFile}`);
console.log(`⏳ Processing... (may take 30-60 seconds first run)`);

const command = `python "${pythonScript}" "${audioFile}"${language !== 'eng' ? ` "${language}"` : ''}`;

exec(command, { encoding: 'buffer' }, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error: ${stderr}`);
        return;
    }

    // Decode output as UTF-8
    const transcription = stdout.toString('utf8').trim();
    console.log(`✅ Transcription: ${transcription}`);
});