# MOCK-ANIMATION — 1Pro Studio design mocks

Bản mock tĩnh (HTML/CSS/JS thuần, không build) tái hiện **thiết kế hiện tại của onepro-liff**,
dùng làm nền để dựng và so sánh các phương án UI mới cho sếp lựa chọn.

## Cấu trúc

- `index.html` — hub: danh sách các mock/phương án.
- `create-flow.html` — **Baseline**: tái hiện 1:1 page *create* và toàn bộ flow tạo nhạc
  (Seed → 画像 → ムード → ボーカル → テキスト → 作成) + màn 作成中 (processing). Mobile-first.
- `styles.css` — design tokens + component styles trích trực tiếp từ `onepro-liff`
  (`globals.css` + `tailwind.config.ts`): màu `#F58F22`, nền tối `#09090e`, glass card, step-dots…

## Chạy

Mở `index.html` (hoặc `create-flow.html`) trong trình duyệt bất kỳ. Không cần build, không cần server.
Font Noto Sans JP tải qua Google Fonts (cần internet); mọi thứ còn lại là local.

## Nguồn thiết kế (đối chiếu với repo liff)

| Mock | Nguồn onepro-liff |
|------|-------------------|
| Shell + ambient | `src/app/(app)/layout.tsx` |
| Chat panel + step dots | `src/components/studio/chat-panel.tsx` |
| Options từng bước | `src/components/studio/inline-options.tsx` |
| Tokens + classes | `src/app/globals.css`, `tailwind.config.ts` |
| Nội dung (JA) | `src/lib/i18n/locales/ja.json` |

## Tiếp theo

Dựng các phương án **A / B / C** cho màn chọn テーマ (chuyển card ngang → list dọc,
tap để lộ tiêu đề / mô tả / công ty phát hành / hashtag) — xoay quanh baseline này.
