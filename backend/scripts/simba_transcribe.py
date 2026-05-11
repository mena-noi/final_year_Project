import sys
import torch
from transformers import AutoProcessor, AutoModelForCTC
import librosa
import numpy as np
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get HF token
hf_token = os.getenv("HF_TOKEN")

print("Loading Simba-M model...", file=sys.stderr)

# Load processor and model
processor = AutoProcessor.from_pretrained("UBC-NLP/Simba-M", token=hf_token)
model = AutoModelForCTC.from_pretrained("UBC-NLP/Simba-M", token=hf_token)

# Move to GPU if available
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
model.eval()

print(f"Model loaded on {device}", file=sys.stderr)

def transcribe(audio_path, language):
    """
    Transcribe audio file using Simba-M
    language: 'amh' for Amharic, 'orm' for Oromo
    """
    # Load audio (16kHz mono)
    audio, sr = librosa.load(audio_path, sr=16000, mono=True)
    
    # Process audio
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
    input_values = inputs.input_values.to(device)
    
    # Get logits
    with torch.no_grad():
        logits = model(input_values).logits
    
    # Decode
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)[0]
    
    return transcription

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python simba_transcribe.py <audio_file> <language>", file=sys.stderr)
        print("Language: 'amh' for Amharic, 'orm' for Oromo", file=sys.stderr)
        sys.exit(1)
    
    audio_file = sys.argv[1]
    language = sys.argv[2]
    
    if not os.path.exists(audio_file):
        print(f"Error: File not found - {audio_file}", file=sys.stderr)
        sys.exit(1)
    
    try:
        result = transcribe(audio_file, language)
        # Output raw UTF-8
        sys.stdout.buffer.write(result.encode('utf-8'))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)