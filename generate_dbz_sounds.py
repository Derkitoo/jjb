import wave
import math
import random
import struct

sample_rate = 44100

def write_wav(filename, samples):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2) # 16-bit
        f.setframerate(sample_rate)
        packed = bytearray()
        for s in samples:
            val = max(-32767, min(32767, int(s * 32767)))
            packed.extend(struct.pack('<h', val))
        f.writeframes(packed)

# 1. DBZ Scouter Beep (Authentic 3-burst digital FM scan)
def gen_scouter():
    samples = []
    duration = 0.6
    total_frames = int(sample_rate * duration)
    for i in range(total_frames):
        t = i / sample_rate
        # 3 fast bursts
        burst_idx = int(t * 8) % 2
        if burst_idx == 0:
            fm = math.sin(2 * math.pi * 35 * t) * 300
            freq = 1400 + fm
            s = 0.5 * math.sin(2 * math.pi * freq * t) + 0.3 * (1.0 if math.sin(2 * math.pi * (freq * 0.5) * t) > 0 else -1.0)
            env = math.exp(-15 * (t % 0.125))
            samples.append(s * env * 0.6)
        else:
            samples.append(0.0)
    return samples

# 2. DBZ Super Saiyan Aura Charge (Roaring sub-bass + FM golden aura resonance)
def gen_aura():
    samples = []
    duration = 1.2
    total_frames = int(sample_rate * duration)
    for i in range(total_frames):
        t = i / sample_rate
        # Envelope: swell in, sustain, fade out
        if t < 0.2:
            env = t / 0.2
        elif t > 0.9:
            env = (1.2 - t) / 0.3
        else:
            env = 1.0

        # Deep sub-bass hum
        sub = math.sin(2 * math.pi * 55 * t) * 0.4
        # Roaring FM aura sweep
        freq_sweep = 120 + 350 * (t / 1.2)
        fm = math.sin(2 * math.pi * 45 * t) * 150
        aura_wave = math.sin(2 * math.pi * (freq_sweep + fm) * t) * 0.35
        # Noise rumble
        noise = (random.random() * 2 - 1) * 0.15 * math.sin(2 * math.pi * 80 * t)
        
        val = (sub + aura_wave + noise) * env * 0.8
        samples.append(val)
    return samples

# 3. DBZ Senzu Recovery Chime
def gen_senzu():
    samples = []
    duration = 0.8
    total_frames = int(sample_rate * duration)
    notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    for i in range(total_frames):
        t = i / sample_rate
        note_idx = min(len(notes) - 1, int(t / 0.12))
        freq = notes[note_idx]
        note_t = t - (note_idx * 0.12)
        
        s = math.sin(2 * math.pi * freq * t) * 0.5 + math.sin(2 * math.pi * freq * 2 * t) * 0.2
        env = math.exp(-8 * note_t) if note_t >= 0 else 0
        samples.append(s * env * 0.7)
    return samples

# 4. DBZ Kamehameha Blast (Energy build + explosive release)
def gen_kamehameha():
    samples = []
    duration = 1.5
    total_frames = int(sample_rate * duration)
    for i in range(total_frames):
        t = i / sample_rate
        if t < 0.6:
            # Build up
            env = (t / 0.6) ** 2
            freq = 200 + 800 * (t / 0.6)
            fm = math.sin(2 * math.pi * 60 * t) * 200
            s = math.sin(2 * math.pi * (freq + fm) * t) * 0.4
        else:
            # Release blast
            blast_t = t - 0.6
            env = math.exp(-3 * blast_t)
            freq = 150 + (random.random() * 40 - 20)
            noise = (random.random() * 2 - 1) * 0.4
            sub = math.sin(2 * math.pi * 65 * t) * 0.5
            s = (noise + sub) * 0.6
        samples.append(s * env * 0.8)
    return samples

write_wav('public/sounds/dbz-scouter.wav', gen_scouter())
write_wav('public/sounds/dbz-aura.wav', gen_aura())
write_wav('public/sounds/dbz-senzu.wav', gen_senzu())
write_wav('public/sounds/dbz-kamehameha.wav', gen_kamehameha())
print("Successfully generated DBZ sound WAV files in public/sounds/")
