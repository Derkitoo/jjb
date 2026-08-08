import imageio_ffmpeg
import subprocess
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
input_file = "temp_audio.webm"
sounds_dir = "public/sounds"

clips = [
    {
        "filename": "dbz-round-start.mp3",
        "start": "00:02:43",
        "end": "00:02:53",
        "alias": "dbz-aura.mp3"
    },
    {
        "filename": "dbz-last-minute.mp3",
        "start": "00:01:45",
        "end": "00:01:55",
        "alias": "dbz-yt-extract.mp3"
    },
    {
        "filename": "dbz-rest.mp3",
        "start": "00:00:23",
        "end": "00:00:28",
        "alias": "dbz-senzu.mp3"
    },
    {
        "filename": "dbz-finish.mp3",
        "start": "00:00:37",
        "end": "00:00:43",
        "alias": "dbz-kamehameha.mp3"
    }
]

for c in clips:
    out_path = os.path.join(sounds_dir, c["filename"])
    if os.path.exists(out_path):
        try:
            os.remove(out_path)
        except:
            pass
    cmd = [
        ffmpeg_exe,
        "-y",
        "-ss", c["start"],
        "-to", c["end"],
        "-i", input_file,
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "192k",
        out_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(out_path):
        print(f"Extracted {c['filename']} ({c['start']} to {c['end']}) - {os.path.getsize(out_path)} bytes")
        # Overwrite alias for compatibility
        alias_path = os.path.join(sounds_dir, c["alias"])
        with open(out_path, "rb") as f_in, open(alias_path, "wb") as f_out:
            f_out.write(f_in.read())
