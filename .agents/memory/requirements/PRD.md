# KẾ HOẠCH TÁI CẤU TRÚC FIRESTORE (Database Migration Plan)
**Dự án:** Crypto Trend Signal
**Mục tiêu:** Xử lý triệt để nguy cơ tràn 1MB Document trên Firestore (`chat_history`, `backtest_history`, `crypto_favs_*`, `coffeeHistory`).

---

## 1. PHÂN TÍCH VẤN ĐỀ (VỤN VỠ BỘ NHỚ)
Document `users/{uid}` hiện tại được thiết kế theo dạng **"Monolithic Document"** (Nhồi mọi thứ vào 1 cục). 
* Hệ lụy 1: Vỡ giới hạn 1MB cứng của Firestore (Error 400).
* Hệ lụy 2: Trả phí oan (Egress / Read cost). Mỗi lần user login, họ phải tải cả MB lịch sử về dù chỉ muốn xem Profile.
* Hệ lụy 3: Race condition (Ghi đè dữ liệu) khi dùng Spread Array `[...old, new]` trên mảng `coffeeHistory`.

## 2. THIẾT KẾ GIẢI PHÁP & TỰ PHẢN BIỆN (TRADE-OFFS)

### Giải pháp cốt lõi
1. **Dữ liệu lớn, tăng trưởng không giới hạn (Chat, Backtest):** Tách thành Sub-collections (hoặc Root Collection).
2. **Dữ liệu mảng, tần suất thấp (CoffeeHistory):** Dùng `arrayUnion()`.
3. **Dữ liệu tuỳ chỉnh, số lượng vừa (Crypto Favs):** Chuẩn hóa thành Array giới hạn độ dài hoặc sub-collection.

### Tự Phản Biện Giải Pháp (Self-Critique)

**CÂU HỎI 1: Tại sao dùng Sub-collection `users/{uid}/chat_sessions` mà không dùng Root Collection `/chat_sessions` (có trường uid)?**
* **Ưu điểm Sub-collection:** Kế thừa quyền bảo mật (Security Rules) dễ dàng hơn. Cấu trúc tổ chức dạng phân cấp (`users` -> data của user).
* **Nhược điểm Sub-collection:** Khi muốn query toàn cục (ví dụ Admin muốn đếm tổng số chat session của *tất cả* user), phải dùng `collectionGroup()` query, đòi hỏi phải tạo Index riêng và tốn kém hơn.
* **Quyết định (Tối ưu nhất cho App này):** Dùng **Sub-collection** vì app chủ yếu fetch data theo từng user riêng lẻ (User A chỉ xem chat của A).

**CÂU HỎI 2: Với lịch sử thanh toán `coffeeHistory`, việc dùng `arrayUnion` đã phải tối ưu nhất chưa?**
* **Phản biện:** `arrayUnion` giải quyết được lỗi ghi đè dữ liệu đồng thời (Race Condition), NHƯNG nó không xóa được bản chất "Mảng vô tận" (Unbounded Array). Nếu 1 tài khoản giả mạo thực hiện hàng ngàn giao dịch rác (mỗi giây nạp 1 lần test), mảng này vẫn sẽ chạm mốc 1MB. Hơn nữa, không thể update (sửa đổi) 1 phần tử cụ thể trong mảng bằng Firebase SDK (chỉ có thể xóa phần tử đó và thêm mới).
* **Quyết định:** Nếu `coffeeHistory` chỉ ghi nhận lịch sử nâng cấp Premium hiếm khi xảy ra (mỗi tháng/vài tháng 1 lần), thì `arrayUnion` trong `users/{uid}` là giải pháp Lean/MVP (Nhanh, gọn). Nếu coi nó là hoá đơn tài chính chuẩn, BẮT BUỘC phải tạo root collection `/transactions`.

**CÂU HỎI 3: Về `crypto_favs_*`, việc nhồi toàn bộ LocalStorage vào `settings` bằng vòng lặp đã thực sự nguy hiểm chưa?**
* **Phản biện:** Có. Đây là rủi ro về bảo mật (Injection) và rác dữ liệu. User có thể dùng DevTools tạo 10,000 key `crypto_favs_x` trong LocalStorage với dung lượng 100 bytes/key. Khi `authStore.pushToFirestore` chạy, nó sẽ bơm rác này lên Firestore, phá hủy hoàn toàn Document `users`.
* **Tối ưu nhất:** Thay vì lưu Key-Value rời rạc động, phải chuẩn hóa thành một mảng cố định (Ví dụ: `favorites: ['BTCUSDT', 'ETHUSDT']`). Giới hạn mảng tối đa 50 phần tử.

## 3. HAI PHƯƠNG ÁN KIẾN TRÚC (TECH STACK)

### Phương án 1: Lean/MVP (Tối ưu hóa trực tiếp trên Firebase)
* **Mô tả:** Giữ nguyên Firebase làm Database duy nhất. Sửa lại cấu trúc sang Sub-collections.
* **Chi phí:** Phát triển cực nhanh (trong 1 ngày). Tăng lượng "Document Read" (Mỗi lần lấy list chat tốn 1 read/item), nhưng giảm "Bandwidth" (không tải rác).
* **Kiến trúc:** 
  - `users/{uid}`: Chỉ chứa Profile.
  - `users/{uid}/chat_sessions/{sessionId}`
  - `users/{uid}/backtest_history/{backtestId}`
  - Favs: Dùng array có limit (`favorites: string[]`).

### Phương án 2: Scalable/Hybrid (Chuyển log/history sang Supabase/PostgreSQL)
* **Mô tả:** Firestore rất dở và đắt đỏ cho việc lưu trữ dữ liệu Time-series/Log có tính quan hệ (Chat history, Trade backtest). Chuyển cụm History sang Postgres (như Supabase).
* **Chi phí:** Tốn thời gian setup DB thứ 2. Tốn công viết lại Backend/API. 
* **Ưu điểm:** Query cực mạnh (Filter theo thời gian, tính tổng PnL backtest toàn hệ thống bằng SQL). Chi phí rẻ hơn rất nhiều so với Firestore nếu dữ liệu phình to lên hàng triệu record.

---

## 4. KẾ HOẠCH TRIỂN KHAI (Dành cho Phương án 1)

**Phase 1: Refactor authStore.js (Tách cơ chế Push/Pull)**
* Dọn dẹp hàm `_executePush` nguy hiểm (Xóa logic quét localStorage bừa bãi).
* Chuẩn hóa Key lưu `crypto_favs` vào 1 Array.
* Thay thế Spread Operator bằng `arrayUnion` cho mảng `coffeeHistory`.

**Phase 2: Xây dựng Database Service riêng cho History**
* Tạo file `src/shared/lib/dbHistory.js` (hoặc đặt chung trong authStore).
* Cung cấp API `saveChatSession(uid, session)`, `getChatSessions(uid)`.
* Cung cấp API `saveBacktest(uid, backtest)`, `getBacktests(uid)`.

**Phase 3: Migration (Xử lý dữ liệu cũ)**
* Khi user cũ đăng nhập, nếu phát hiện `history.chat_history` còn tồn tại trong user doc, ứng dụng sẽ âm thầm chạy hàm convert: Tách mảng đó ra thành nhiều Docs ném vào Sub-collection, sau đó xóa field `history` cũ đi.

**Phase 4: Cập nhật UI**
* Sửa `ChatAgentView.jsx`, `BacktestView` (nếu có) chuyển sang gọi hàm DB Service mới.
