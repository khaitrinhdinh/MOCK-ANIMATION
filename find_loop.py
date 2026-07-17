#!/usr/bin/env python3
"""
Cắt clip Veo (xoay dư nhiều vòng) thành loop 1 chiều khít:
quét từng frame, so với frame đầu, tìm frame sớm nhất mà dải nhạc về ĐÚNG hướng
ban đầu -> cắt video tại đó. Không boomerang, không crossfade.

Chạy sau gen_loop_veo.py:
    python3 find_loop.py
Ra: assets/veo/video4_loop_cut.mp4
"""
import subprocess, sys, os

IN  = sys.argv[1] if len(sys.argv) > 1 else "assets/veo/video6_loop_drip.mp4"
OUT = IN.replace(".mp4", "_cut.mp4")
W, H = 48, 84                 # downscale để so nhanh
MIN_GAP_S = 0.8               # bỏ qua các frame quá gần đầu (chưa xoay được bao nhiêu)
TOL = 1.15                    # chấp nhận frame khớp trong 1.15x của điểm khớp tốt nhất

here = os.path.dirname(os.path.abspath(__file__))
os.chdir(here)

def probe_fps(path):
    out = subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0",
        "-show_entries","stream=r_frame_rate","-of","default=noprint_wrappers=1:nokey=1", path]).decode().strip()
    n, d = out.split("/")
    return float(n)/float(d)

def read_gray_frames(path):
    fsz = W*H
    p = subprocess.Popen(["ffmpeg","-v","error","-i",path,"-vf",f"scale={W}x{H},format=gray",
        "-f","rawvideo","-"], stdout=subprocess.PIPE)
    frames = []
    while True:
        buf = p.stdout.read(fsz)
        if len(buf) < fsz:
            break
        frames.append(buf)
    p.wait()
    return frames

def mse(a, b):
    s = 0
    for x, y in zip(a, b):
        d = x - y
        s += d*d
    return s / len(a)

def main():
    if not os.path.exists(IN):
        sys.exit(f"Chưa thấy {IN} — chạy gen_loop_veo.py trước.")
    fps = probe_fps(IN)
    frames = read_gray_frames(IN)
    n = len(frames)
    print(f"fps={fps:.2f}, tổng {n} frame")
    f0 = frames[0]
    start = int(MIN_GAP_S * fps)
    scores = [(i, mse(f0, frames[i])) for i in range(start, n)]
    gmin = min(s for _, s in scores)
    # frame sớm nhất khớp đủ tốt -> loop ngắn nhất
    cut = next(i for i, s in scores if s <= gmin * TOL)
    t = cut / fps
    print(f"Điểm khớp tốt nhất MSE={gmin:.1f}; cắt tại frame {cut} = {t:.3f}s")
    subprocess.check_call(["ffmpeg","-y","-v","error","-i",IN,"-t",f"{t:.3f}",
        "-an","-c:v","libx264","-pix_fmt","yuv420p","-movflags","+faststart",OUT])
    print(f"XONG -> {OUT}  (loop dài {t:.2f}s)")
    print("Đổi trong design-3.html: 'assets/veo/video4_loop_veo.mp4' -> 'assets/veo/video4_loop_cut.mp4', bật loop.")

if __name__ == "__main__":
    main()
