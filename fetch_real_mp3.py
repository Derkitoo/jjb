import urllib.request
import os

os.makedirs("public/sounds", exist_ok=True)

test_sources = {
    "dbz-scouter.mp3": [
        "https://www.myinstants.com/media/sounds/dbz-scouter.mp3",
        "https://www.myinstants.com/media/sounds/scouter-sound-effect.mp3",
        "https://www.myinstants.com/media/sounds/dbz-scouter-sound-effect.mp3"
    ],
    "dbz-aura.mp3": [
        "https://www.myinstants.com/media/sounds/super-saiyan-aura.mp3",
        "https://www.myinstants.com/media/sounds/ssj-aura.mp3",
        "https://www.myinstants.com/media/sounds/dbz-aura.mp3"
    ],
    "dbz-kamehameha.mp3": [
        "https://www.myinstants.com/media/sounds/kamehameha.mp3",
        "https://www.myinstants.com/media/sounds/goku-kamehameha.mp3",
        "https://www.myinstants.com/media/sounds/kame-hame-ha.mp3"
    ],
    "dbz-teleport.mp3": [
        "https://www.myinstants.com/media/sounds/dbz-teleport.mp3",
        "https://www.myinstants.com/media/sounds/instant-transmission.mp3",
        "https://www.myinstants.com/media/sounds/dbz-teleportation.mp3"
    ]
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

for target_name, url_list in test_sources.items():
    dest = os.path.join("public/sounds", target_name)
    success = False
    for url in url_list:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp, open(dest, 'wb') as f:
                content = resp.read()
                if len(content) > 1000: # Valid audio size
                    f.write(content)
                    print(f"Downloaded {target_name} from {url} ({len(content)} bytes)")
                    success = True
                    break
        except Exception as e:
            continue
    if not success:
        print(f"Could not find working link for {target_name}")
