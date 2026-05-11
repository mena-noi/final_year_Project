import sys
import whisper

# Load model (small is good balance of speed/accuracy)
model = whisper.load_model("small")

def transcribe(audio_path):
    result = model.transcribe(audio_path, language="en")
    return result["text"]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("No file provided", file=sys.stderr)
        sys.exit(1)
    
    result = transcribe(sys.argv[1])
    print(result)