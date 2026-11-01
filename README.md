# ⛪ Thánh Đường Nguyện Ước Online — TikTok Live 24/7 (`nhathoonline`)

**Thánh Đường Nguyện Ước Online** (`tiktok-sanctuary-live`) là bộ công cụ livestream tương tác 24/7 trên TikTok với giao diện dọc chuẩn **9:16 (1080×1920)**. Người xem trên phiên Live có thể gửi bình luận cầu nguyện, gõ phím tắt nhận thông điệp phước lành cá nhân, thả tim rung chuông, bấm Follow nhận Nến Vàng và tặng quà để ghim lời nguyện ước lên **Ngôi Vị Ân Nhân VIP**.

---

## ✨ Tính năng nổi bật

- **🕯️ Đài Nến Cầu Nguyện 3 Tầng (2.5D):**
  - Tự động thắp nến kèm tên, ảnh đại diện và lời nguyện ước khi khán giả bình luận.
  - Hỗ trợ bộ lọc từ ngữ không phù hợp (`sanitizePrayer`) để giữ không gian trang nghiêm.
- **💬 Gõ phím `1`, `2`, `3` nhận Thông Điệp Phước Lành riêng (Oracle Cards):**
  - **Gõ `1`** (hoặc nhắc đến *bình an*): Xin vía **Bình An Tâm Hồn** — thắp *Nến Ngọc*.
  - **Gõ `2`** (hoặc nhắc đến *gia đình, cha mẹ, sức khỏe*): Cầu **Sức Khỏe Cha Mẹ & Gia Đạo** — thắp *Nến Hồng*.
  - **Gõ `3`** (hoặc nhắc đến *công việc, may mắn, thi cử, tài lộc*): Cầu **Công Việc & Thi Cử Hanh Thông** — thắp *Nến Lam*.
- **🔔 Thả Tim Rung Chuông & ➕ Follow Nhận Nến Vàng:**
  - Mỗi lượt thả tim làm rung Chuông Thánh Đường và cộng điểm vào **Bảng Vàng Ân Phúc**.
  - Khán giả bấm **Follow** được ghi danh vào Sổ Vàng Hộ Mệnh (+25 điểm) và tặng ngay 1 **Nến Vàng**.
- **👑 Ngôi Vị Ân Nhân VIP & Đặc Quyền Lễ Vật:**
  - Người tặng quà được ghim tên, avatar và lời cầu nguyện lên đỉnh màn hình (**Ngôi Vị Ân Nhân VIP**).
  - Phân cấp hiệu ứng theo giá trị quà tặng: Nến Vàng Kim, Hào Quang Thánh Giá, Đàn Bồ Câu Trắng và Đại Nến Hoàng Kim.
- **🌟 Thanh Tích Lũy Phép Lành Toàn Phòng (100%):**
  - Mọi tương tác (Bình luận, Follow, Chia sẻ, Thả tim, Tặng quà) đều tích lũy thanh Phép Lành. Khi đạt **100%**, toàn phòng bùng nổ hiệu ứng **Mưa Sao Băng Hồng Ân**.
- **🗣️ Giọng Đọc AI (Google TTS Tiếng Việt) & Nhạc Nền 24/7:**
  - Tự động đọc tên tín hữu, lời cầu nguyện và lời cảm ơn ân nhân bằng giọng AI tiếng Việt.
  - Tích hợp 3 giai điệu nhạc nền không bản quyền (Đàn Đại Phong Cầm, Piano Thánh Ca, Tiếng Mưa Đêm) cùng tiếng chuông ngân & đàn Harp.
- **🛠️ Bảng Điều Khiển Admin Pro (Realtime):**
  - Kết nối trực tiếp phòng TikTok Live bằng `username` hoặc link live.
  - Tích hợp màn hình xem trước **Live Preview 9:16** và bộ nút **Giả lập tương tác / Khán giả mẫu tự động** để kiểm thử hiệu ứng trước khi lên sóng.

---

## 📋 Yêu cầu hệ thống

- **Node.js**: Phiên bản `18.x` trở lên (khuyến nghị Node.js LTS).
- **OBS Studio** hoặc **TikTok Live Studio**: Dùng để gắn màn hình Browser Source (`1080x1920`) khi phát trực tiếp.

---

## 🚀 Hướng dẫn cài đặt & khởi chạy

### 1. Cài đặt thư viện

Mở terminal (PowerShell hoặc Command Prompt) tại thư mục dự án và chạy:

```bash
npm install
```

### 2. Khởi động Server

- **Cách 1 (Nhanh nhất trên Windows):** Nhấp đúp vào file `Chay_Tool_Live.bat`. Script sẽ tự động khởi chạy server tại cổng `8888` và mở sẵn 2 tab trình duyệt (Màn hình Live & Bảng điều khiển Admin).
- **Cách 2 (Dùng dòng lệnh):**

```bash
npm start
```

Sau khi khởi động thành công:
- 👉 **Màn hình Live 9:16 (Gắn vào OBS / TikTok Live Studio):** `http://localhost:8888`
- 🛠️ **Bảng điều khiển Admin & Giả lập hiệu ứng:** `http://localhost:8888/admin`

*(Có thể đổi cổng mặc định `8888` qua biến môi trường `PORT`, ví dụ: `PORT=3000 npm start`).*

---

## 🎥 Hướng dẫn thiết lập Livestream (OBS / TikTok Live Studio)

1. Mở **Bảng điều khiển Admin** tại `http://localhost:8888/admin`:
   - Nhập **TikTok Username** (ví dụ: `@tenkenh`) hoặc dán link phòng Live đang phát, sau đó bấm **🔗 Kết Nối TikTok Live**.
   - Nếu cổng chữ ký miễn phí báo bận (`403` / `429`), bạn có thể lấy **Sign API Key** miễn phí tại [eulerstream.com](https://www.eulerstream.com) và dán vào ô *Sign API Key* trong trang Admin.
   - Tùy chỉnh **Tiêu đề kênh**, **Chủ đề màu sắc (Theme)**: *Đêm Huyền Diệu (`night`)*, *Bình Minh Vàng (`dawn`)*, *Giáng Sinh Ấm Áp (`christmas`)*, cùng âm lượng nhạc nền và chế độ đọc AI.
2. Trong **OBS Studio** hoặc **TikTok Live Studio**:
   - Thêm nguồn **Browser Source (Nguồn Trình Duyệt)**.
   - Đặt **URL**: `http://localhost:8888`
   - Đặt kích thước: **Width = `1080`**, **Height = `1920`** (khung dọc 9:16).
   - Bấm chuột tương tác (Interact) vào màn hình Live 1 lần và nhấn nút **"🔊 Bấm vào đây 1 lần để bật Nhạc Thánh Đường & Giọng Đọc AI"** để mở khóa âm thanh trình duyệt.

---

## 📂 Cấu trúc thư mục

```text
├── Chay_Tool_Live.bat      # Script khởi động nhanh trên Windows (tự mở Live & Admin)
├── package.json            # Thông tin dự án và các thư viện phụ thuộc
├── server/
│   ├── index.js            # Express + Socket.IO server, kết nối TikTok Live & Google TTS proxy
│   └── state.js            # Quản lý trạng thái Thánh Đường, phân loại lời nguyện, BXH & lưu trữ
├── public/
│   ├── index.html          # Giao diện Màn hình Live 9:16 (1080x1920)
│   ├── admin.html          # Giao diện Bảng điều khiển Admin Pro & công cụ giả lập
│   ├── style.css           # Hiệu ứng 2.5D, ánh sáng nhà thờ, đài nến và animation
│   ├── app.js              # Logic hiển thị client, âm thanh Web Audio / TTS & hiệu ứng Canvas
│   └── assets/             # Hình nền kiến trúc Thánh Đường
├── data/
│   └── state.json          # File tự động lưu trữ trạng thái phiên Live (runtime)
└── tests/
    └── state.test.js       # Bộ unit test kiểm thử logic trạng thái & phân loại cầu nguyện
```

---

## 🧪 Chạy kiểm thử (Unit Tests)

Dự án sử dụng trình chạy test tích hợp sẵn của Node.js (`node --test`). Để kiểm tra toàn bộ logic điểm thưởng, phân loại phím tắt `1-2-3`, lọc từ ngữ và thanh Phép Lành:

```bash
npm test
```
