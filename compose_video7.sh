#!/bin/bash
# video7_final = đoạn CHUYỂN CẢNH (nước -> lá tan -> sóng) + giọt xoay fade-in.
# Dùng CÙNG layout với make_loop7.sh để final và loop cân xứng (khỏi nhảy kích thước).
set -e
cd "$(dirname "$0")"

WAVE="assets/veo/video7_wave.mp4"          # chuyển cảnh 6s
DROP="assets/video4_2_seamless.mp4"        # giọt xoay
OUT="assets/veo/video7_final.mp4"

# ---- layout: PHẢI trùng make_loop7.sh ----
W=720; H=1280
WS=0.60; DW=460; WAVE_Y=430; DROP_Y=40
FADE_ST=3.8          # giọt hiện khi sóng đã thành hình
# ------------------------------------------

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WAVE")
WW=$(awk "BEGIN{printf \"%d\", $W*$WS}")
WX=$(awk "BEGIN{printf \"%d\", ($W-$WW)/2}")
DX=$(awk "BEGIN{printf \"%d\", ($W-$DW)/2}")
ffmpeg -y -v error -i "$WAVE" -stream_loop -1 -i "$DROP" -filter_complex "\
[0:v]scale=${WW}:-1,pad=${W}:${H}:${WX}:${WAVE_Y}:black,format=gbrp[w]; \
[1:v]scale=${DW}:-1,colorlevels=rimin=0.08:gimin=0.08:bimin=0.08,pad=${W}:${H}:${DX}:${DROP_Y}:black[dp]; \
[dp]fade=t=in:st=${FADE_ST}:d=1.2,format=gbrp[dlf]; \
[w][dlf]blend=all_mode=screen,format=yuv420p[v]" \
-map "[v]" -t "$DUR" -an -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "XONG -> $OUT"
