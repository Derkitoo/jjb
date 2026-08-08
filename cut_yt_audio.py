import imageio_ffmpeg
import subprocess
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
input_file = "temp_audio.webm"
output_mp3 = "public/sounds/dbz-yt-extract.mp3"

# Cut from 00:00:23 for 5 seconds (to 00:00:28)
cmd = [
    ffmpeg_exe,
    "-y",
    "-ss", "00:00:23",
    "-to", "00:00:28",
    "-i", input_file,
    "-vn",
    "-acodec", "libmp3lame",
    "-ab", "192k",
    output_mp3
]

result = subprocess.run(cmd, capture_output=True, text=True)
print("FFmpeg output:", result.stderr)

if os.path.exists(output_mp3):
    print(f"Successfully extracted segment 0:23-0:28 to {output_mp3} ({os.path.getsize(output_mp3)} bytes)")
