import imageio_ffmpeg
import subprocess
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
input_file = "temp_audio.webm"
output_mp3 = "public/sounds/dbz-yt-extract.mp3"
output_aura = "public/sounds/dbz-aura.mp3"

# Cut from 00:00:23 for 4 seconds (to 00:00:27)
cmd = [
    ffmpeg_exe,
    "-y",
    "-ss", "00:00:23",
    "-to", "00:00:27",
    "-i", input_file,
    "-vn",
    "-acodec", "libmp3lame",
    "-ab", "192k",
    output_mp3
]

result = subprocess.run(cmd, capture_output=True, text=True)
print("FFmpeg output:", result.stderr)

if os.path.exists(output_mp3):
    print(f"Successfully extracted segment 0:23-0:27 to {output_mp3} ({os.path.getsize(output_mp3)} bytes)")
    # Also overwrite dbz-aura.mp3 so start of round uses this exact clip!
    with open(output_mp3, "rb") as f_in, open(output_aura, "wb") as f_out:
        f_out.write(f_in.read())
    print(f"Updated {output_aura} with YouTube extract!")
