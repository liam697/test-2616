Build Chat Embed SDK

## 1. Mục tiêu

Xây dựng một Chat SDK đơn giản cho phép các website bên thứ ba nhúng (embed) widget chat real-time vào trang của họ, tương tự Intercom/Tidio/LiveChat/Crisp.
SDK phải có thể publish như 1 package/script (hoặc demo embed), và khách hàng chỉ cần nhúng bằng một `<script>` tag.

## 2. Công nghệ

- Next.js (latest)
- React (latest)
- Tailwind CSS latest (styling)
- Ant Design v6 latest (UI components)
- Socket.IO client (latest)
- Zustand (state management)

## 3. Embed SDK

Khách hàng nhúng SDK bằng:

```html
<script
  src="https://your-sdk-domain.com/sdk.js"
  data-api-key="your-api-key"
  data-position="bottom-right"
></script>
```

Yêu cầu

- Khi script load xong, SDK tự mount widget vào trang.
- Widget mặc định là floating button ở góc dưới phải.
- SDK không được phá CSS/DOM của host page

## 4. UI Widget

### 4.1 Floating Button

- Nút nổi (floating button).
- Click => mở chat popup.

### 4.2 Popup Chat Window

Gồm 3 phần:

- Header: tiêu đề + status realtime: Connecting... / Online / Offline
- Messages list: hiển thị tin nhắn theo thời gian (của mình vs người khác)
- Input: nhập tin nhắn + gửi (Enter gửi, Shift+Enter xuống dòng)
  UI Requirements
- Sử dụng AntD components
- Layout/styling dùng Tailwind.
- Tất cả field trong form hiển thị tuyến tính, width: 100%.

## 5. Realtime

- Kết nối tới Socket.IO server.
- Join room theo flow (bên dưới).
- Auto reconnect khi mất kết nối.
- Hiển thị status realtime:
  - Connecting…
  - Online
  - Offline

## 6. Configurable qua data attributes

SDK đọc config từ script tag:

- data-position: bottom-right | bottom-left
- data-api-key (có thể mock usage)

## 7. FLOW — 3 bước

#### Step 1 — Tạo user (Form)

Cho phép user nhập:

- Tên
- Email
- Ngày sinh
- Giới tính (Select)
- Switch: “Tôi đồng ý với điều khoản và điều kiện”
  Validation bắt buộc

* Tên

  - required
  - max 30 ký tự
  - chỉ chữ cái in hoa/in thường (A–Z, a–z) (không số, không ký tự đặc biệt)

* Email

  - required
  - validate email format

* Ngày sinh (DatePicker)

  - required
  - user phải >= 18 tuổi

* Giới tính (Select)

  - default: Male
  - options: Male | Female | Other

* Switch đồng ý điều khoản

  - required

#### Step 2 — Join phòng chat hoặc tạo phòng mới

User có 2 lựa chọn:

- Join room hiện có (nhập roomId hoặc chọn từ list mock)
- Tạo room mới (Form tạo phòng bên dưới)

Form tạo phòng chat

- Tên phòng (Input)

  - required
  - max 50 ký tự

- Ngày bắt đầu phòng (DatePicker)

  - không được chọn ngày trong quá khứ
  - default = today
  - format: DD/MM/YYYY

- Số lượng max users (InputNumber)

  - min 2
  - max 10
  - default 2

- Buttons

  - Tạo Phòng (type primary)
  - Hủy (type secondary)
    Khi tạo phòng thành công → set roomId và chuyển Step 3.

#### Step 3 — Chat realtime giữa 2 user

- Vào room đã join/tạo.
- Gửi/nhận tin nhắn realtime giữa các user trong cùng room.
- Unread count tăng khi popup đóng và có message mới.

## 8. Packaging/Build

- dist/sdk.js (IIFE/UMD) để embed trực tiếp bằng script tag.
- demo-host/index.html (trang HTML thuần) để test embed.
- Hướng dẫn chạy demo local (README).

## 9. Tài liệu (output)

README.md

- Cách build SDK
- Cách chạy demo embed
- Có thể thay đổi giao diện theo yêu cầu
- Có khả năng truy vết thông tin website gửi

DESIGN.md

- Kiến trúc module (init, ui, store, socket, config)
- Cách tránh CSS conflict
- Cách handle reconnect + status

- Url Deploy
- Video demo hoặc screenshots
