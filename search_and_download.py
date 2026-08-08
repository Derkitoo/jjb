import urllib.request
import re
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def get_mp3_for_query(query, save_filename):
    search_url = f"https://www.myinstants.com/en/search/?name={urllib.parse.quote(query)}"
    req = urllib.request.Request(search_url, headers=headers)
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
        matches = re.findall(r"play\('(/media/sounds/[^']+\.mp3)'", html)
        if matches:
            mp3_path = matches[0]
            full_mp3_url = f"https://www.myinstants.com{mp3_path}"
            dest = os.path.join("public/sounds", save_filename)
            req_audio = urllib.request.Request(full_mp3_url, headers=headers)
            with urllib.request.urlopen(req_audio) as resp, open(dest, 'wb') as f:
                f.write(resp.read())
            print(f"Downloaded {save_filename} from {full_mp3_url} ({os.path.getsize(dest)} bytes)")
            return True
    except Exception as e:
        print(f"Error fetching {query}: {e}")
    return False

get_mp3_for_query("scouter", "dbz-scouter.mp3")
