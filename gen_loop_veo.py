#!/usr/bin/env python3
"""
Tạo clip LOOP cho video4 bằng Veo 3.1 (image-to-video, first frame = last frame).
Mẹo: đưa cùng 1 ảnh làm frame đầu VÀ frame cuối -> Veo sinh chuyển động rồi quay
về đúng frame ban đầu -> nối lại liền mạch (seamless loop).

Cách chạy:
    cd MOCK-ANIMATION
    python3 gen_loop_veo.py

Yêu cầu: GEMINI_API_KEY nằm trong ../.env  (dòng KEY=... hoặc GEMINI_API_KEY=...)
Chi phí (bạn tự trả): fast 720p = $0.10/giây. 5s ~ $0.50/lần render.
"""
import base64, json, time, os, sys, urllib.request, urllib.error

# ---- chọn phase muốn render ----
PHASE = "video7"        # "phase1" / "phase2" / "phase3_zoom" / "phase3_fall" / "video7"
# ---------------------------------

MODEL   = "veo-3.1-fast-generate-preview"   # lastFrame chưa chạy trên key AI Studio -> chỉ dùng frame đầu
USE_LASTFRAME = False
ASPECT  = "9:16"
RES     = "720p"

PRESETS = {
    "phase1": {
        "FRAME": "assets/veo/v4_lastframe.png",
        "OUT":   "assets/veo/video4_loop_veo.mp4",
        "DURATION": 8,   # Veo chỉ nhận 4/6/8
        "PROMPT": (
            "Keep the exact same scene, lighting, colors and style as the input image, unchanged. "
            "The golden musical staff with notes inside the droplet spins FAST and continuously around "
            "the vertical axis at a constant high speed, completing at least TWO to THREE full 360-degree "
            "revolutions, without slowing or stopping. Keep the SAME notes throughout: do not add, remove "
            "or reposition any note beyond the rotation. The droplet stays completely still and centered. "
            "Static camera, no zoom, no new effects, no added elements."
        ),
    },
    "phase2": {
        "FRAME": "assets/veo/v5_lastframe.png",
        "OUT":   "assets/veo/video5_loop_glow.mp4",
        "DURATION": 4,   # 4s = tối thiểu Veo cho phép (2s không được)
        "PROMPT": (
            "Keep the exact same golden leaf plant, same shape, colors, lighting and black background "
            "as the input image, completely unchanged. The only motion: a warm golden glow of light "
            "travels smoothly UP from the base of the stem into the leaves, making the leaves shimmer, "
            "then gently fades back to the exact starting brightness, so the last frame looks identical "
            "to the first frame. The plant stays perfectly still, no movement, no swaying, no growing. "
            "Static camera, no zoom, no new elements, no new leaves."
        ),
    },
    "phase3_zoom": {
        "FRAME": "assets/veo/v5_lastframe.png",
        "OUT":   "assets/veo/video6a_zoom.mp4",
        "DURATION": 4,
        "PROMPT": (
            "This is a pure CAMERA MOVE on the exact plant already in the input image. Do NOT create, "
            "replace, redraw, regenerate or change any leaf; use the real existing leaves from the "
            "image, keep their exact shape, veins, colors and lighting. It is only a zoom / dolly-in, "
            "like magnifying part of the same photo. "
            "0.0-1.0s: hold on the full plant exactly as in the image, still and calm. "
            "1.0-2.5s: the camera smoothly pushes in toward ONE of the existing lower leaves until that "
            "single real leaf fills the frame and is shown COMPLETELY, never cropped or cut off. The "
            "other leaves simply move out of frame from the zoom; nothing is redrawn or added. "
            "2.5-4.0s: at the pointed tip of that same real leaf a tiny golden water droplet slowly "
            "appears and swells, catching a warm highlight, hanging at the leaf tip. The droplet does "
            "NOT fall, it only forms and hangs, trembling slightly at the end. Keep that whole leaf in "
            "frame. Very calm, slow, elegant. No splashing, no water below, do NOT grow or invent new "
            "leaves, no new elements, no text."
        ),
    },
    "phase3_fall": {
        "FRAME": "assets/veo/v6a_lastframe.png",   # trích từ cuối video6a_zoom sau khi render xong
        "OUT":   "assets/veo/video6b_fall.mp4",
        "DURATION": 4,
        "PROMPT": (
            "A cinematic 4-second shot continuing exactly from the input image (same framing, leaf, "
            "golden droplet on the leaf tip, colors, lighting, black background), static camera, no "
            "zoom. 0.0-0.8s: the heavy golden droplet hangs at the leaf tip, trembling, stretching "
            "downward as it is about to fall. 0.8-1.2s: the droplet detaches from the leaf and begins "
            "to fall. 1.2-2.4s: the single droplet falls slowly and softly straight down through the "
            "dark space. 2.4-3.2s: the droplet reaches the calm dark water surface below and lands "
            "delicately, creating ONE small gentle ripple ring. 3.2-4.0s: the small ripple spreads "
            "outward softly and settles back to a calm still water surface. Very calm, slow, quiet and "
            "elegant. NO splashing, no spray, no bouncing droplets, no big waves, only the single "
            "droplet and one soft ripple. No new leaves, no new elements, no text."
        ),
    },
    "video7": {
        "FRAME": "assets/veo/phase3_lastframe.png",   # frame cuối video6: lá + giọt + gợn nước
        "OUT":   "assets/veo/video7_wave.mp4",
        "DURATION": 6,
        "PROMPT": (
            "A cinematic 6-second shot continuing exactly from the input image (golden leaf, a golden "
            "droplet, dark reflective water with ripples), same colors, warm golden lighting, pure "
            "black background, static camera. "
            "0.0-1.5s: the golden droplet finishes landing on the dark water, soft concentric ripple "
            "rings spread outward across the surface, the leaf still visible at the top. "
            "1.5-3.5s: the golden leaf slowly fades away and dissolves into the dark background until it "
            "is completely gone, while at the same time the circular water ripples begin transforming "
            "into glowing golden sound waves. "
            "3.5-6.0s: the leaf is fully gone; the ripples have become a horizontal band of glowing "
            "golden sound waves - flowing luminous sine-wave lines and an audio-equalizer waveform made "
            "of light, several parallel glowing golden lines gently oscillating like music, centered "
            "horizontally across the middle of the frame, settling into a steady calm rhythm. "
            "IMPORTANT: by the end only the glowing golden sound-wave band remains on pure black. Keep "
            "the upper-center area empty dark space. Do NOT create any droplet, ball, seed or musical "
            "note. No text, no splashing."
        ),
    },
}
_p = PRESETS[PHASE]
FRAME, OUT, DURATION, PROMPT = _p["FRAME"], _p["OUT"], _p["DURATION"], _p["PROMPT"]

BASE = "https://generativelanguage.googleapis.com/v1beta"

def load_key():
    env = os.path.join(os.path.dirname(__file__), "..", ".env")
    with open(env) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                if k.strip() in ("GEMINI_API_KEY", "KEY", "GOOGLE_API_KEY"):
                    return v.strip().strip('"').strip("'")
            elif line.startswith("AIza"):        # .env chỉ có mỗi key trần
                return line
    sys.exit("Không tìm thấy API key trong ../.env")

def post(url, body, key):
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(),
        headers={"x-goog-api-key": key, "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, "-- server nói:")
        print(e.read().decode())
        sys.exit(1)

def get(url, key):
    req = urllib.request.Request(url, headers={"x-goog-api-key": key})
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def main():
    key = load_key()
    img_b64 = base64.b64encode(open(FRAME, "rb").read()).decode()
    frame = {"bytesBase64Encoded": img_b64, "mimeType": "image/png"}
    inst = {"prompt": PROMPT, "image": frame}
    if USE_LASTFRAME:
        inst["lastFrame"] = frame         # <-- cùng ảnh -> loop khép kín (chỉ chạy trên Standard)
    body = {
        "instances": [inst],
        "parameters": {
            "aspectRatio": ASPECT,
            "resolution": RES,
            "durationSeconds": DURATION,  # nếu báo lỗi 'unknown parameter' thì xoá dòng này
            "sampleCount": 1,
        },
    }
    print(f"[1/3] Gửi yêu cầu tới {MODEL} ...")
    op = post(f"{BASE}/models/{MODEL}:predictLongRunning", body, key)
    name = op["name"]
    print("     operation:", name)

    print("[2/3] Đang render (poll mỗi 10s)...")
    while True:
        time.sleep(10)
        st = get(f"{BASE}/{name}", key)
        if st.get("done"):
            break
        print("     ...chưa xong")
    if "error" in st:
        sys.exit("LỖI: " + json.dumps(st["error"], ensure_ascii=False))

    uri = st["response"]["generateVideoResponse"]["generatedSamples"][0]["video"]["uri"]
    print("[3/3] Tải video về:", OUT)
    req = urllib.request.Request(uri, headers={"x-goog-api-key": key})
    with urllib.request.urlopen(req) as r, open(OUT, "wb") as f:
        f.write(r.read())
    print("XONG ->", OUT)
    print("Xem thử, nếu ưng thì đổi trong design-3.html: 'assets/video4.mp4' -> '" + OUT + "'")

if __name__ == "__main__":
    main()
