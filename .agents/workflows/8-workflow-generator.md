---
description: Use when you need to create, design, or standardise a new workflow. This meta-workflow enforces structural consistency, skill integration, and best practices across all custom agent workflows.
---

# Quy trình làm việc chuẩn 8-Workflow-Generator (Meta-Workflow V2.0)

Đây là **Meta-Workflow** (Quy trình dùng để tạo ra Quy trình). BẠN BẮT BUỘC tuân thủ quy trình này mỗi khi nhận nhiệm vụ thiết kế, soạn thảo, hoặc chuẩn hóa một file workflow mới.

## GIAI ĐOẠN 1: KIỂM CHỨNG & THU THẬP YÊU CẦU

1. **Quét Chống Trùng Lặp (Anti-Duplication):**
   - Trước tiên, dùng `list_dir` tại `.agents/workflows` để kiểm tra các file đang có.
   - Nếu đã có quy trình tương tự, đề xuất **Nâng cấp** quy trình cũ thay vì tạo mới. 
   - Đặt tên file theo định dạng `[số_thứ_tự]-[tên-ngắn-gọn].md` (đảm bảo số thứ tự không trùng lặp).

2. **Tra cứu Kỹ Năng (Skill Matching):**
   - Dùng `grep_search` quét file `.agents/antigravity-awesome-skills/CATALOG.md`.
   - Chọn ra tối đa 3-5 skills (kỹ năng) cốt lõi nhất phù hợp với mục tiêu của workflow chuẩn bị tạo.

## GIAI ĐOẠN 2: SOẠN THẢO CẤU TRÚC CHUẨN

3. **Thiết lập Khung Bắt Buộc (Boilerplate):**
   - **Frontmatter:** BẮT BUỘC có khối YAML ở đầu file chứa `description:` (bằng tiếng Anh).
   - **Cấu trúc 3 Giai Đoạn:** Chia nội dung thành 3 phần: (1) Phân tích, (2) Thực thi, (3) Hoàn tất.

4. **Nhúng Tiêu Chuẩn Hệ Thống (Core Constraints):**
   - **Anti-Amnesia:** Yêu cầu Agent đọc các file `.md` trạng thái (`ACTIVE_TASK.md`) trước khi code.
   - **Impact Analysis:** Yêu cầu quét tầm ảnh hưởng (`grep_search`) trước khi sửa đổi diện rộng.
   - **Tool Reality Check:** Chỉ định hướng Agent dùng các công cụ CÓ THẬT trong hệ thống (VD: `view_file`, `list_dir`, `grep_search`, `write_to_file`).

5. **Tích hợp Tự Động Hóa (Turbo Mode):**
   - Nếu trong workflow có bước chạy command (`run_command`) an toàn (chỉ đọc, không phá hoại), hãy hướng dẫn Agent đặt thẻ `// turbo` phía trên bước đó để hệ thống auto-run, tiết kiệm thời gian chờ user.

6. **DỪNG VÀ CHỜ PHÊ DUYỆT (Stop and Wait):**
   - Ở cuối Giai đoạn 2 của workflow mới, BẮT BUỘC chèn lệnh yêu cầu Agent hỏi chính xác: *"Bạn có đồng ý với hướng đi và cấu trúc này không?"* VÀ DỪNG LẠI.

## GIAI ĐOẠN 3: KIỂM TRA & XUẤT BẢN

7. **Khai báo RED FLAGS (Giới hạn đỏ):**
   - Thêm phần `## 🚫 RED FLAGS - DỪNG VÀ BẮT ĐẦU LẠI` ở cuối file. 
   - Liệt kê 3-4 hành vi cấm kỵ (VD: Ảo giác công cụ, bỏ qua Stop and Wait).

8. **Review & Lưu trữ:**
   - Sử dụng công cụ `write_to_file` để lưu trữ file vào đúng thư mục.

---

## 🚫 RED FLAGS CỦA META-WORKFLOW NÀY
**Nếu bạn (Agent) đang viết một workflow mới mà vi phạm các điều sau, BẠN PHẢI DỪNG LẠI:**
- Tạo file mà KHÔNG `list_dir` để kiểm tra trùng lặp số thứ tự.
- Gắn một công cụ tưởng tượng (không có thật trong bộ default API) vào workflow.
- Bỏ qua khối YAML `description:` ở đầu file.
- Không có bước in ra `<thought_process>` và "Stop and Wait" để hỏi ý kiến người dùng trước khi lưu.
---
## CƠ CHẾ TỰ PHẢN BIỆN (SELF-REFLECTION MANDATORY)
TRƯỚC KHI in ra kết quả cuối cùng cho người dùng, Agent BẮT BUỘC phải tạo một <thought_process> ngầm để thực hiện **"Phiên toà Tự Phản Biện"**.
1. **Cross-Check (Kiểm chứng chéo):** Giải pháp mình vừa nghĩ ra có thực sự khớp 100% với mã nguồn gốc không? Hay do mình đang lấy râu ông nọ cắm cằm bà kia (Ảo giác)?
2. **Devil's Advocate (Đóng vai ác):** Nếu áp dụng giải pháp này, hệ thống có sập ở đâu không? (Ví dụ: vòng lặp vô hạn, quá tải Payload, thiếu Rate Limit).
3. **Output Gate (Cổng xuất dữ liệu):** CHỈ ĐƯỢC PHÉP in ra kết quả markdown cuối cùng cho người dùng SAU KHI phiên toà tự phản biện xác nhận giải pháp là Fact-based và an toàn. Nếu phát hiện lỗ hổng trong lúc tự phản biện, phải tự động quay lại bước suy luận và sửa logic ngầm.
