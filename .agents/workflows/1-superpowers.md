---
description: Use when starting any new task or receiving a request. Establishes the core workflow combining superpowers and standard project constraints (Universal).
---

# Quy trình làm việc cốt lõi 1-Superpowers (V2.0)

Đây là **Workflow gốc (Core Workflow)**. Nó thiết lập tư duy làm việc chuẩn mực của AI Agent đối với BẤT KỲ dự án nào, tích hợp triết lý Superpowers và Anti-Amnesia.

## GIAI ĐOẠN 1: KHỞI TẠO & ĐỒNG BỘ BỐI CẢNH

1. **Khởi động Quy trình Superpowers:**
   - **[ANTI-AMNESIA]:** BẮT BUỘC tạo hoặc cập nhật file `.agents/memory/ACTIVE_TASK.md` chứa Checklist công việc trước khi bắt tay vào làm bất cứ việc gì.
   - Dùng `grep_search` quét file `.agents/antigravity-awesome-skills/CATALOG.md` để tìm các skill cần thiết cho nhiệm vụ (VD: `brainstorming`, `writing-plans`).
   - Tuyệt đối không nhào vô code ngay. Hãy đánh giá xem tác vụ này là Nhỏ (Fix bug) hay Lớn (Tạo tính năng/Dự án mới).

2. **Đồng bộ Kiến trúc Dự án (Dynamic Context):**
   - **BẮT BUỘC:** Đọc nội dung file `docs/CONTEXT.md` HOẶC `README.md` tại thư mục gốc của dự án hiện hành bằng công cụ `view_file` để nắm cấu trúc trước khi làm.
   - **[GHI NHỚ NGỮ CẢNH HỆ SINH THÁI]:** Đặc biệt lưu ý các thành phần cốt lõi của dự án (VD: Cơ sở dữ liệu và bảo mật qua **Firebase Security Rules**, Môi trường Frontend triển khai trên **Netlify Production**, Bộ nhớ tĩnh bằng **Cloudinary**, Máy chủ tính toán AI/Backtest trên **Colab**).

3. **[FEATURE CONTEXT CHECK] — Đồng bộ context feature đang làm:**
   - Dùng `view_file` kiểm tra `.agents/memory/FEATURE_CONTEXT.md`
   - **Tồn tại (Status = IN_PROGRESS):** Đọc NGAY, pin `## 🏗 Design Decisions` vào working memory. Đây là source of truth cho session này.
   - **Tồn tại (Status = DONE):** Xóa file. Ghi `ACTIVE_TASK.md` = COMPLETE.
   - **Không tồn tại + task lớn (≥2 files, feature mới):** Kích hoạt `/3-plan-writing` để tạo spec + FEATURE_CONTEXT trước khi code.
   - **Không tồn tại + task nhỏ (≤1 file, không thay đổi architecture):** Bỏ qua, tiếp tục bình thường.

## GIAI ĐOẠN 2: THỰC THI (EXECUTION)

3. **Giao tiếp và Chờ phê duyệt (Stop and Wait):**
   - Luôn hỏi ngược lại người dùng để xác định rõ hướng đi.
   - *Nếu tác vụ lớn:* Yêu cầu Agent kích hoạt workflow `/3-plan-writing` để xuất ra bản phác thảo và chờ phê duyệt.
   - *Nếu tác vụ nhỏ:* BẮT BUỘC hỏi: *"Bạn có đồng ý với hướng đi này không?"* và **DỪNG LẠI** chờ phản hồi.

4. **Code theo phương pháp TDD & Impact Analysis Toàn Diện:**
   - **[ANTI-AMNESIA TUYỆT ĐỐI]:** TRƯỚC KHI SỬA CODE, bạn BẮT BUỘC phải dùng công cụ `grep_search` quét theo từ khóa liên quan trên TOÀN BỘ dự án (VD: đổi logic hàm, phải search keyword hàm đó). Nhiệm vụ của bạn là phải tìm và **SỬA HẾT TẤT CẢ CÁC VỊ TRÍ LIÊN QUAN**. Không bao giờ được phép sửa một chỗ rồi bỏ sót các chỗ khác.
   - Truy xuất skill `mp_tdd` từ CATALOG. Bắt buộc code theo nguyên tắc: Thêm Test Fail -> Fix Code -> Run Pass -> Refactor. Không code theo chiều ngang (Horizontal Slicing).

## GIAI ĐOẠN 3: HOÀN TẤT & LƯU TRỮ

5. **Đánh giá & Tự động Cập nhật Tài liệu:**
   - Nếu bạn vừa thêm/sửa một kiến trúc quan trọng, bạn **PHẢI** tự động dùng `write_to_file` để ghi đè cập nhật nội dung file `docs/CONTEXT.md`.

6. **Lưu trữ Kinh nghiệm (Lessons Learned):**
   - Nếu là Thành công (Bài học hay, Kỹ thuật tốt): Ghi chú vào `.agents/memory/Experience.md`.
   - Nếu là Thất bại (Bug, Edge Case): BẮT BUỘC ghi chú lại vào các file `.agents/memory/Fix-Issue.md`, `.agents/memory/Edge-Cases.md` hoặc `.agents/memory/Security.md`.

7. **Dọn dẹp mã phụ trợ (Clean up):**
   - Xóa bỏ tất cả các file mã phụ trợ dùng một lần trong quá trình nháp (VD: các file `.py` hoặc `.js` trong mục scratch).

---

## 🚫 RED FLAGS - DỪNG VÀ BẮT ĐẦU LẠI
**Nếu bạn (Agent) có ý định vi phạm, HÃY DỪNG LẠI:**
- Bắt đầu viết code khi chưa hỏi ý kiến người dùng ở Bước 3.
- Bắt đầu code mà chưa đọc file `CONTEXT.md` / `README.md`.
- Viết một đống tính năng khổng lồ cùng lúc thay vì Tracer Bullet (Vi phạm `mp_tdd`).
- Sửa đổi Component lõi mà không thực hiện Impact Analysis (`grep_search`).
- Bỏ qua việc tự động cập nhật `.agents/memory/Edge-Cases.md` sau khi fix lỗi (với lý do "lỗi này nhỏ quá không cần ghi").
---
## CƠ CHẾ TỰ PHẢN BIỆN (SELF-REFLECTION MANDATORY)
TRƯỚC KHI in ra kết quả cuối cùng cho người dùng, Agent BẮT BUỘC phải tạo một <thought_process> ngầm để thực hiện **"Phiên toà Tự Phản Biện"**.
1. **Cross-Check (Kiểm chứng chéo):** Giải pháp mình vừa nghĩ ra có thực sự khớp 100% với mã nguồn gốc không? Hay do mình đang lấy râu ông nọ cắm cằm bà kia (Ảo giác)?
2. **Devil's Advocate (Đóng vai ác):** Nếu áp dụng giải pháp này, hệ thống có sập ở đâu không? (Ví dụ: vòng lặp vô hạn, quá tải Payload, thiếu Rate Limit).
3. **Output Gate (Cổng xuất dữ liệu):** CHỈ ĐƯỢC PHÉP in ra kết quả markdown cuối cùng cho người dùng SAU KHI phiên toà tự phản biện xác nhận giải pháp là Fact-based và an toàn. Nếu phát hiện lỗ hổng trong lúc tự phản biện, phải tự động quay lại bước suy luận và sửa logic ngầm.
