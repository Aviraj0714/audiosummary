from flask import Flask, request, jsonify, send_file
from moviepy.editor import *
from gtts import gTTS
import os

app = Flask(__name__)
OUTPUT_DIR = "uploads"
os.makedirs(OUTPUT_DIR, exist_ok=True)  # Ensure output directory exists

def generate_video(text, output_file="code_review_summary.mp4"):
    audio_file = os.path.join(OUTPUT_DIR, "speech.mp3")
    
    # Generate AI Narration
    tts = gTTS(text, lang="en")
    tts.save(audio_file)

    # Load audio
    audio = AudioFileClip(audio_file)

    # Create a simple background (black screen)
    img = ColorClip(size=(1280, 720), color=(0, 0, 0), duration=audio.duration)

    # Merge audio and background
    video = img.set_audio(audio)

    # Save the video
    video_file = os.path.join(OUTPUT_DIR, output_file)
    video.write_videofile(video_file, fps=24, codec="libx264")

    return video_file

@app.route("/generate-summary", methods=["POST"])
def generate_summary():
    try:
        data = request.get_json()
        code_diff = data.get("codeDiff", "No code changes provided")

        # 1️⃣ Generate AI Explanation (Mocked for now)
        explanation = f"Here is an AI-generated summary of your code changes:\n{code_diff}"

        # 2️⃣ Convert Summary to Video
        video_file = generate_video(explanation)

        return jsonify({"message": "Video generated successfully", "video_url": f"/download/{os.path.basename(video_file)}"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    return send_file(os.path.join(OUTPUT_DIR, filename), as_attachment=True)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
