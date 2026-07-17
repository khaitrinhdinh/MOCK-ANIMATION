#!/bin/bash
# Bước 2: biến clip Veo thành loop mượt. Miễn phí, chạy local.
#   ./make_seamless.sh boomerang       # xuôi + ngược -> KHÍT 100% (xoay phải rồi trái)
#   ./make_seamless.sh xfade 0.8       # crossfade-wrap Xs (giữ 1 chiều, có thể còn hơi lệch)
set -e
cd "$(dirname "$0")/assets/veo"
IN="video4_loop_veo.mp4"
MODE="${1:-boomerang}"

if [ "$MODE" = "boomerang" ]; then
  OUT="video4_loop_boomerang.mp4"
  ffmpeg -y -v error -i "$IN" -filter_complex \
  "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]" \
  -map "[v]" -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT"
  echo "XONG -> assets/veo/$OUT (xuôi+ngược, loop khít 100%)"
else
  OUT="video4_loop_seamless.mp4"
  X="${2:-0.8}"
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
  SHIFT=$(awk "BEGIN{print $D-$X}")
  ffmpeg -y -v error -i "$IN" -filter_complex \
  "[0:v]split[body][pre];[pre]trim=duration=${X},format=yuva420p,fade=t=in:st=0:d=${X}:alpha=1,setpts=PTS+${SHIFT}/TB[jt];[body][jt]overlay=eof_action=pass[v]" \
  -map "[v]" -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT"
  echo "XONG -> assets/veo/$OUT (crossfade ${X}s)"
fi
echo "Đổi trong design-3.html: 'assets/veo/video4_loop_veo.mp4' -> 'assets/veo/$OUT' rồi bật loop."
