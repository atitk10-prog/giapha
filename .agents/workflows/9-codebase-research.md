---
description: Use when you need to comprehensively research an existing codebase top-down. Generates a concise architecture report, visual C4 diagrams, and deep-dive trace of core feature workflows.
---

# Quy trình làm việc chuẩn 9-Codebase-Research (Phân tích Kiến trúc & Luồng)

## GIAI ĐOẠN 1: ĐỊNH VỊ KIẾN TRÚC TỔNG THỂ (TOP-DOWN)

1. **Khởi động & Quét Cơ Sở (Skill: `docs-architect`, `analyze-project`):**
   - [ANTI-AMNESIA] BẮT BUỘC đọc file `README.md`, `package.json`, `requirements.txt`, hoặc `docker-compose.yml` bằng `view_file` để trích xuất Tech Stack.
   - Dùng `list_dir` tại thư mục gốc. Xác định các thư mục quan trọng (Entry points, Config, Source, Docs).

2. **Dựng Sơ Đồ Component (Skill: `c4-container`):**
   - Lọc ra các modules chính.
   - Tự động phác thảo **Mermaid C4 Diagram** (hoặc Flowchart) cho kiến trúc high-level của hệ thống.

## GIAI ĐOẠN 2: TRUY VẾT WORKFLOW TÍNH NĂNG (TRACEABILITY)

3. **Chọn Lọc Tính Năng Cốt Lõi:**
   - Xác định 3-5 tính năng/domain quan trọng nhất dựa trên router hoặc module.

4. **Khai Quật Luồng Xử Lý (Feature Workflow Tracing):**
   - Với mỗi tính năng, BẮT BUỘC truy vết theo chiều dọc (Vertical Slice):
     1. **Entry:** API Endpoint / UI Route nào gọi đến?
     2. **Middleware:** Có qua Authentication/Validation nào không?
     3. **Core Logic:** Service/Handler nào xử lý nghiệp vụ chính?
     4. **Data Layer:** Tương tác với Model/Table nào trong Database?
   - Cấm dùng `grep_search` mò mẫm vô định. Phải lần theo chuỗi `import` hoặc Call Stack.

5. **DỪNG VÀ CHỜ PHÊ DUYỆT (Stop and Wait):**
   - In ra `<thought_process>` chứa danh sách các Tính năng vừa tìm được.
   - Hỏi người dùng: *"Tôi đã lập sơ đồ luồng cho X tính năng. Bạn có muốn điều chỉnh, hoặc cần tôi đi sâu vào dòng code cụ thể của tính năng nào trước khi xuất báo cáo không?"* VÀ DỪNG LẠI.

## GIAI ĐOẠN 3: XUẤT BẢN BÁO CÁO

6. **Đóng Gói Báo Cáo:**
   - Lưu kết quả vào file `.agents/memory/CODEBASE_REPORT.md`. Cấu trúc chuẩn:
     - 1. Executive Summary & Tech Stack.
     - 2. System Architecture (Kèm sơ đồ Mermaid).
     - 3. Core Workflows (Chi tiết luồng dọc của các tính năng lớn).
     - 4. Known Technical Debt / Code Smells (Nếu phát hiện trong lúc đọc).

---

## 🚫 RED FLAGS - DỪNG VÀ BẮT ĐẦU LẠI
**Nếu bạn (Agent) vi phạm, HÃY DỪNG LẠI:**
- Đọc code theo chiều ngang (đọc hết folder views rồi mới qua folder models) thay vì truy vết luồng theo chiều dọc (Vertical Tracing).
- Báo cáo workflow tính năng nhưng không chỉ ra được Table/Database model nào bị ảnh hưởng.
- Không có biểu đồ Mermaid.js cho cấu trúc tổng thể.
- Bỏ qua bước Hỏi ý kiến ở Giai đoạn 2.

---
## CƠ CHẾ TỰ PHẢN BIỆN (SELF-REFLECTION MANDATORY)
TRƯỚC KHI in ra kết quả cuối cùng cho người dùng, Agent BẮT BUỘC phải tạo một <thought_process> ngầm để thực hiện **"Phiên toà Tự Phản Biện"**.
1. **Cross-Check (Kiểm chứng chéo):** Giải pháp mình vừa nghĩ ra có thực sự khớp 100% với mã nguồn gốc không? Hay do mình đang lấy râu ông nọ cắm cằm bà kia (Ảo giác)?
2. **Devil's Advocate (Đóng vai ác):** Nếu áp dụng giải pháp này, hệ thống có sập ở đâu không? (Ví dụ: vòng lặp vô hạn, quá tải Payload, thiếu Rate Limit).
3. **Output Gate (Cổng xuất dữ liệu):** CHỈ ĐƯỢC PHÉP in ra kết quả markdown cuối cùng cho người dùng SAU KHI phiên toà tự phản biện xác nhận giải pháp là Fact-based và an toàn. Nếu phát hiện lỗ hổng trong lúc tự phản biện, phải tự động quay lại bước suy luận và sửa logic ngầm.
