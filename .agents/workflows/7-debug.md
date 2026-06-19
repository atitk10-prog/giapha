---
description: Quy trình làm việc chuẩn 7-Debug (Hệ thống gỡ lỗi)
---

# Quy trình làm việc chuẩn 7-Debug (Hệ thống gỡ lỗi V2.0)

Workflow chuyên dụng cho việc truy vết, phân tích Log, và sửa lỗi (Debugging) trong hệ thống mã nguồn một cách an toàn và dứt điểm.

## GIAI ĐOẠN 1: KHỞI TẠO & KHÁM NGHIỆM TỬ THI

1. **Đồng bộ Bối cảnh (Dynamic Context):**
   - **BẮT BUỘC:** Đọc nội dung file `docs/CONTEXT.md`, `README.md` hoặc tài liệu kiến trúc tương đương của thư mục làm việc hiện tại bằng `view_file` để nắm bối cảnh hệ thống trước khi gỡ lỗi.

2. **Thu thập Log & Stack Trace (Evidence Collection):**
   - Không được mò mẫm code ngay. Hãy yêu cầu người dùng cung cấp nguyên văn báo lỗi (Error Log, Console Output, Stack Trace).
   - Nếu có thể, đề xuất chạy lệnh (`run_command`) an toàn để tái hiện lỗi và lấy log trực tiếp. 
   - Truy cập `.agents/antigravity-awesome-skills/CATALOG.md` tìm các skill như `error-detective` nếu log quá phức tạp.

3. **Truy Vết & Tái Hiện (Trace):**
   - Sau khi có log, dùng `grep_search` để tìm chính xác tên hàm, biến hoặc chuỗi mã gây lỗi.
   - Áp dụng kỹ năng `mp_tdd` (nếu cần): Viết test (hoặc scratch file) để chứng minh hàm đó fail trước khi sửa.

## GIAI ĐOẠN 2: PHÂN TÍCH VÀ CÁCH LY (QUARANTINE)

4. **Quét tầm ảnh hưởng (Impact Analysis - Anti-Amnesia):**
   - Dùng `grep_search` quét xem component/hàm định sửa đang được file nào gọi đến, tránh việc "chữa lợn lành thành lợn què".

5. **Phân Loại Lỗi & Đề Xuất (Brainstorming):**
   - **Lỗi nhỏ (Typo, Syntax, Missing Import):** Trình bày nguyên nhân và xin phép sửa ngay.
   - **Lỗi logic/Kiến trúc phức tạp:** Đưa ra **ít nhất 2-3 giải pháp khả thi** trong `<thought_process>` (kèm đánh giá rủi ro của từng giải pháp). Hỏi người dùng: *"Bạn có đồng ý với giải pháp A hay B không?"* và **DỪNG LẠI** chờ phản hồi.
   - *(Tùy chọn an toàn)*: Khuyến nghị người dùng commit git trước khi Agent sửa mã nếu rủi ro cao.

6. **Sửa đổi khoanh vùng (Bite-Sized Fix):**
   - Khi được duyệt, tiến hành sửa code đúng phạm vi gây lỗi.

## GIAI ĐOẠN 3: XÁC MINH VÀ LƯU TRỮ

7. **Xác minh (Verification):**
   - Chạy lại các luồng test, API hoặc yêu cầu người dùng refresh UI để xác nhận bug đã bị tiêu diệt.

8. **Lưu trữ tri thức (Lessons Learned):**
   - **BẮT BUỘC:** Tự động ghi chú nguyên nhân, cách phát hiện, và giải pháp vào file `.agents/memory/Fix-Issue.md`, `.agents/memory/Edge-Cases.md` hoặc `.agents/memory/Security.md`.

9. **Dọn dẹp (Clean up):**
   - Xóa các file test/scratch sinh ra trong quá trình dò lỗi.

---

## 🚫 RED FLAGS - DỪNG VÀ BẮT ĐẦU LẠI
**Hệ thống sẽ BÁO ĐỘNG ĐỎ nếu bạn (Agent) có ý định:**
- Bắt đầu dò lỗi trong Source Code mà chưa phân tích Error Log / Stack Trace.
- Sửa đổi một hàm lõi (core component) mà KHÔNG thực hiện Impact Analysis (`grep_search` tìm nơi gọi nó).
- Fix lỗi kiến trúc lớn nhưng không đưa ra sự lựa chọn nào cho user mà tự ý sửa luôn (Bỏ qua Stop & Wait).
- Quên ghi chú lại vào file `.agents/memory/Fix-Issue.md` sau khi gỡ lỗi thành công (Mất trí nhớ hệ thống).
---
## CƠ CHẾ TỰ PHẢN BIỆN (SELF-REFLECTION MANDATORY)
TRƯỚC KHI in ra kết quả cuối cùng cho người dùng, Agent BẮT BUỘC phải tạo một <thought_process> ngầm để thực hiện **"Phiên toà Tự Phản Biện"**.
1. **Cross-Check (Kiểm chứng chéo):** Giải pháp mình vừa nghĩ ra có thực sự khớp 100% với mã nguồn gốc không? Hay do mình đang lấy râu ông nọ cắm cằm bà kia (Ảo giác)?
2. **Devil's Advocate (Đóng vai ác):** Nếu áp dụng giải pháp này, hệ thống có sập ở đâu không? (Ví dụ: vòng lặp vô hạn, quá tải Payload, thiếu Rate Limit).
3. **Output Gate (Cổng xuất dữ liệu):** CHỈ ĐƯỢC PHÉP in ra kết quả markdown cuối cùng cho người dùng SAU KHI phiên toà tự phản biện xác nhận giải pháp là Fact-based và an toàn. Nếu phát hiện lỗ hổng trong lúc tự phản biện, phải tự động quay lại bước suy luận và sửa logic ngầm.
