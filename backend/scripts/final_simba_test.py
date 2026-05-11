# final_simba_test.py
import os
os.environ["HUGGING_FACE_HUB_TOKEN"] = os.getenv("HUGGING_FACE_HUB_TOKEN", "YOUR_HUGGING_FACE_TOKEN_HERE")
import torch
from transformers import pipeline

# 1. Load the pipeline (the adapter should be loaded automatically)
# Using Simba-M as per our current plan
pipe = pipeline("automatic-speech-recognition", model="UBC-NLP/Simba-M", device=0 if torch.cuda.is_available() else -1)

# 2. Explicitly tell the pipeline to use the right model and language
# This tries to load a specific "language adapter" if one exists for Oromo.
if hasattr(pipe.model, 'load_adapter'):
    try:
        print("Attempting to load Oromo adapter...")
        # The adapter name is often the language code. We will test different common formats.
        pipe.model.load_adapter("orm")
        pipe.model.active_adapter = "orm"
        print("Adapter loaded.")
    except Exception as e:
        print(f"Could not load 'orm' adapter, trying 'orm_Latn'.\nError: {e}")
        try:
            pipe.model.load_adapter("orm_Latn")
            pipe.model.active_adapter = "orm_Latn"
        except:
            print("No specific Oromo adapter found, relying on base model.")
else:
    print("This model variant does not use adapters.")

# 3. Force the generation to use Oromo
print("Starting transcription for Oromo...")
result = pipe(r"C:\Users\Owner\Desktop\AVB\backend\jerry.wav", generate_kwargs={"language": "orm", "task": "transcribe"})
print(f"\n--- Final Result ---")
print(f"Transcription: {result['text']}")