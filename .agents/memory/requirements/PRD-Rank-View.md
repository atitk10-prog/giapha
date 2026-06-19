# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD) - TÍNH NĂNG BẢNG VÀNG BACKTEST (RANK VIEW)

## 1. TỔNG QUAN TÍNH NĂNG
Tính năng "Rank View" (Bảng Vàng Backtest) nhằm tạo một đấu trường thuật toán, lưu trữ và tôn vinh cấu hình Bot Trading tốt nhất của cộng đồng cho từng cặp giao dịch và khung thời gian.

## 2. CHÂN DUNG NGƯỜI DÙNG (USER PERSONAS)
- **Người tạo (Contributors):** Người dùng chạy Backtest Mega Grid/AI. Khi đạt kết quả tốt, hệ thống tự động push lên đấu trường để khẳng định vị thế.
- **Người xem (Observers):** Người dùng muốn tham khảo các cấu hình tối ưu nhất trên thị trường để áp dụng cho Bot Trade thực tế.

## 3. CORE FEATURES & LOGIC VẬN HÀNH

### A. Điều Kiện Vượt Ải (Eligibility)
Kết quả backtest chỉ được duyệt lên Bảng Vàng nếu thoả mãn **TẤT CẢ** các điều kiện cực đoan sau:
- Total PnL >= 50%
- Win Rate >= 30%
- Total Trades >= 20
- Max Drawdown (MaxDD) <= 25%

### B. Công Thức Tính Điểm Xếp Hạng (Rank Score)
Do chỉ giữ lại **1 kết quả Đỉnh nhất duy nhất** cho mỗi cặp Coin + Timeframe (Ví dụ: 1 slot duy nhất cho `BTCUSDT_1h`), hệ thống quy đổi 4 chỉ số thành 1 Điểm số tổng hợp theo trọng số do Founder quyết định:
- **Total PnL (40%):** Yếu tố quyết định.
- **Win Rate (30%):** Độ tin cậy của thuật toán.
- **MaxDD (20%):** Trọng số bảo toàn vốn. Áp dụng công thức lật ngược `(25 - MaxDD)`.
- **Total Trades (10%):** Đảm bảo mẫu thử (Sample size) đáng tin cậy.

*Nếu kết quả vừa chạy ra có `Rank Score` cao hơn kỷ lục đang giữ top 1 -> Ghi đè (Overwrite) kỷ lục hiện tại bất kể UID nào.*

### C. Giao Diện (UI/UX)
- Tái sử dụng layout Master-Detail (giống `LiveSignalsView`).
- **Master Panel:** Chọn sàn (Binance Spot, OKX Futures...).
- **Detail Panel:** Danh sách các cặp Coin (VD: BTCUSDT_1h) đang giữ Top 1.
- Hiển thị danh tính: Ghi nhận `uid` ẩn dưới Database, giao diện chỉ hiển thị `displayName` để tôn vinh người tạo. Click vào Row sẽ thay `RankView` thành `FinalResult` (Chi tiết cấu hình bot) -> **Không bật popup**, tái sử dụng 100% logic UI/UX từ component `FinalResult` hiện có, render trực tiếp để luồng người dùng mượt mà hơn.
- Cấu trúc Detail View: Xếp danh sách theo thời gian cập nhật mới nhất (`updatedAt` DESC). Bắt buộc phải **ảo hóa danh sách (Virtualization)** (Sử dụng `react-virtuoso` đã có sẵn trong dự án) để tối ưu hiệu năng khi danh sách lên đến hàng nghìn cặp coin.

### D. Tái Cấu Trúc UI (Refactor Plan)
-> **Trả lời câu hỏi:** HOÀN TOÀN ĐỒNG Ý. Nên tách phần layout hiện tại thành 2 component dùng chung: `crypto-trend-signal\src\shared\ui\layout\MasterVirtualizedList.jsx` và `DetailVirtualizedList.jsx` (Dựa trên khung sườn của `MasterDetail.jsx`). 
Lợi ích:
- Tái sử dụng 100% cho cả `LiveSignalsView` và `RankView`.
- Giảm thiểu code lặp (DRY).
- Chỉ cần truyền Data và Render Props (cho phần ruột) vào là hoạt động.

*=> **Giải đáp câu hỏi MasterDetail:** Lập luận của bạn rất chuẩn xác! `MasterDetail` về bản chất chỉ là bộ khung Layout (chia 2 cột). Nếu ta nhúng cứng code ảo hoá vào nó thì sẽ phá hỏng các trang chỉ cần hiển thị biểu đồ/thông tin. 
**Chốt hướng làm:** Nâng cấp `MasterDetail.jsx` để tối ưu CSS/Mobile responsive. Sau đó, tạo 2 component chuyên biệt là `<MasterVirtualizedList />` (cho cột trái) và `<DetailVirtualizedList />` (cho cột phải). 
Lúc dùng: Tùy ý rắp ráp 2 list này vào Layout `MasterDetail` để đạt hiệu năng tối đa khi dữ liệu Crypto quá lớn.*
=> và thêm `MasterVirtualizedList.jsx` -> vì đây là phát chắc chắn sẽ dùng tính năng ảo hóa vì luôn chứa danh sách. còn DetailVirtualizedList thì tùy tab có hoặc không dùng.

## 4. KIẾN TRÚC HỆ THỐNG & BẢO MẬT (TECH STACK)

### Vấn Đề Firebase Cloud Functions & Giải Pháp Mới
- **Giải Pháp (Vercel + Next.js API):** Do hệ thống đang dùng Next.js App Router, ta sẽ thiết lập một `API Route` (ví dụ: `/api/rank-submit`) chạy bằng Node.js ngay trên Server của Next.js (Hoàn toàn miễn phí theo gói netlify).
  
### Luồng Dữ Liệu Chống Spam (Anti-Cheat Workflow)
1. **Client:** Trình duyệt chạy xong Backtest -> Nếu đạt 4 chỉ số cơ bản -> Gửi payload (gồm log lệnh, cấu hình) lên `/api/rank-submit`. 

*=> **Giải đáp câu hỏi Netlify Functions:** Do bạn đang code bằng Next.js, cách chuẩn nhất là viết code vào thư mục `src/app/api/rank-submit/route.js`. Khi bạn Deploy, thuật toán của Netlify (qua Next.js Plugin) sẽ **tự động biên dịch** thư mục `/api` này thành Netlify Serverless Functions dưới nền. Bạn không cần (và không nên) tạo thư mục `/netlify/functions` thủ công để tránh rác source code. Cứ code chuẩn theo Next.js API, Netlify sẽ tự lo.*
2. **Server (Next.js API):** Tiếp nhận Payload. Xác thực dữ liệu không bị sửa đổi. Tự tính toán lại Rank Score.
3. **Database (Firestore):** Server dùng `Firebase Admin SDK` kiểm tra `Rank Score` trên Firestore. Nếu cao hơn kỷ lục cũ -> Thực hiện lệnh Ghi Đè.

### Cấu Trúc Database (Firestore Schema)
- Collection Root: `rank_backtest`
- Document (Sàn): `BINANCE_SPOT`, `BINANCE_FUTURES`...
- Sub-Collection: `leaderboard`
- Document (Cặp giao dịch): `BTCUSDT_1h`
  - Field: `score` (Number)
  - Field: `totalPnL`, `winRate`, `maxDD`, `totalTrades` (Number)
  - Field: `config` (Object thông số cài đặt)
  - Field: `creator` (Object: `{ uid: "...", displayName: "..." }`)
  - Field: `history` (Mảng log nến, nếu cần thiết, giới hạn size)
  - Field: `updatedAt` (Timestamp)

*=> **Giải đáp:** ĐÚNG! Sub-Collection `leaderboard` sẽ chứa HÀNG NGHÌN Document độc lập (như `BTCUSDT_1h`, `ETHUSDT_4h`, `SOLUSDT_15m`...). 
Kiến trúc này cho phép Firestore dễ dàng thực hiện query dạng: `collection('leaderboard').orderBy('updatedAt', 'desc').limit(50)` để lấy ra 50 cấu hình vừa phá kỷ lục mới nhất trên thị trường.*
