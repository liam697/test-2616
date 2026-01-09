# test-2616

## Cách chạy demo

### 1. Chạy mock server

Chạy tại thư mục `/server`:
npm run mockserver

Server chạy tại:
http://localhost:4000

### 2. Build SDK

Chạy tại thư mục `/sdk` hoặc `/sdkv2`:
npm run build

Sau khi build, file SDK sẽ được xuất ra tại:
demo-host/dist/sdk.js

### 3. Serve website demo

Chạy tại thư mục gốc test-2616:
npx serve demo-host

### 4. Chạy demo

Mở trình duyệt tại:
http://localhost:3000

Website demo sẽ tự động load SDK và hiển thị widget chat.

## Các phiên bản SDK

### SDK V1
- Triển khai đầy đủ chức năng chat realtime cơ bản
- Không sử dụng framework UI
- Tập trung vào logic và khả năng embed

### SDK V2
- Nâng cấp kiến trúc và UI
- Sử dụng React cho giao diện
- Zustand quản lý state
- Ant Design và Tailwind CSS cho UI
- Chức năng tương đương SDK V1

## Ghi chú

- SDK không ghi đè style toàn cục của website host
- Không thay đổi cấu trúc DOM sẵn có
- Có thể mở rộng cấu hình thông qua script tag

## Demo

- Website demo: http://localhost:3000
- Server: http://localhost:4000