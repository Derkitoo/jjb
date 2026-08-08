import urllib.request
import os

sounds_dir = "public/sounds"
os.makedirs(sounds_dir, exist_ok=True)

# Public high-quality DBZ audio sound effect URLs
dbz_urls = {
    "dbz-scouter.mp3": "https://raw.githubusercontent.com/taniarascia/dbz/master/assets/scouter.mp3",
    "dbz-aura.mp3": "https://raw.githubusercontent.com/taniarascia/dbz/master/assets/super-saiyan.mp3",
    "dbz-teleport.mp3": "https://raw.githubusercontent.com/taniarascia/dbz/master/assets/instant-transmission.mp3",
    "dbz-kamehameha.mp3": "https://raw.githubusercontent.com/taniarascia/dbz/master/assets/kamehameha.mp3",
    "dbz-senzu.mp3": "https://raw.githubusercontent.com/taniarascia/dbz/master/assets/heal.mp3"
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for filename, url in dbz_urls.items():
    dest_path = os.path.join(sounds_dir, filename)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded {filename} successfully ({os.path.getsize(dest_path)} bytes)")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
