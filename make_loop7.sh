#!/bin/bash
# Ghép LOOP video7: dải sóng (thu nhỏ) + giọt-nhạc xoay (to), cả 2 loop khép kín 6s.
# Chỉnh kích thước/vị trí ở khối tham số bên dưới rồi chạy: ./make_loop7.sh
set -e
cd "$(dirname "$0")"

WAVE="assets/veo/video7_wave_loop.mp4"    # sóng boomerang 3s (seamless)
DROP="assets/video4_2_seamless.mp4"        # giọt xoay 6s (seamless)
OUT="assets/veo/video7_loop.mp4"

# ---- tham số layout ----
W=720; H=1280; DUR=6.0
WS=0.60          # bề ngang dải sóng theo % khung (nhỏ lại = giảm)
DW=460           # bề ngang giọt (px) (to lên = tăng)
WAVE_Y=430       # vị trí dọc dải sóng (px từ trên)
DROP_Y=40        # vị trí dọc giọt (px từ trên)
# ------------------------

WW=$(awk "BEGIN{printf \"%d\", $W*$WS}")
WX=$(awk "BEGIN{printf \"%d\", ($W-$WW)/2}")
DX=$(awk "BEGIN{printf \"%d\", ($W-$DW)/2}")
ffmpeg -y -v error -stream_loop -1 -i "$WAVE" -stream_loop -1 -i "$DROP" -filter_complex "\
[0:v]scale=${WW}:-1,pad=${W}:${H}:${WX}:${WAVE_Y}:black,format=gbrp[w]; \
[1:v]scale=${DW}:-1,colorlevels=rimin=0.08:gimin=0.08:bimin=0.08,pad=${W}:${H}:${DX}:${DROP_Y}:black,format=gbrp[dlf]; \
[w][dlf]blend=all_mode=screen,format=yuv420p[v]" \
-map "[v]" -t "$DUR" -an -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "XONG -> $OUT"
