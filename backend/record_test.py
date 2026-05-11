import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np

fs = 44100  # Higher sample rate
seconds = 8

print(f"Recording for {seconds} seconds...")
print("Speak CLEARLY and LOUDLY in Amharic")
recording = sd.rec(int(seconds * fs), samplerate=fs, channels=1, dtype=np.int16)
sd.wait()

# Normalize volume (make louder)
recording = np.clip(recording * 3, -32768, 32767).astype(np.int16)

# Resample to 16kHz for Whisper
from scipy import signal
recording_resampled = signal.resample(recording, int(len(recording) * 16000 / fs))
recording_resampled = recording_resampled.astype(np.int16)

write("test_audio.wav", 16000, recording_resampled)
print("Saved as test_audio.wav")