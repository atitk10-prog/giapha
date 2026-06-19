---
description: Use when you have a spec or requirements for a multi-step task, before touching code. Call this to quickly generate a persistent implementation plan.
---

# Lập Kế Hoạch Triển Khai 3-Plan-Writing (V2.0)

Workflow này giúp phân rã các yêu cầu phức tạp thành các bản kế hoạch (Checklist) nhỏ, có thể lưu trữ vĩnh viễn và theo dõi tiến độ dễ dàng.

## GIAI ĐOẠN 1: THU THẬP & NÃO CÔNG (BRAINSTORM)

1. **Định vị Bối cảnh & Skill:**
   - [ANTI-AMNESIA] Đọc file `CONTEXT.md` của thư mục gốc để nắm giới hạn kiến trúc (System Boundaries) trước khi vẽ Plan.
   - Dùng `grep_search` quét `.agents\skills\CATALOG.md` tìm các skill về `plan`, `mp_to-issues`, `tdd` hoặc `superpowers_writing-plans` để nạp triết lý.

2. **Giao tiếp Thiết kế (Brainstorming):**
   - Không tự ý viết Plan ngay. Hãy hỏi người dùng 2-3 câu hỏi để làm rõ các giới hạn hệ thống.
   - Dùng `grep_search` để kiểm tra xem tính năng này đã có file/hàm nào làm tương tự chưa, tránh làm lại (Don't Repeat Yourself - DRY).

3. **Context Gathering Strategy (Chiến lược nạp ngữ cảnh):**
   - Phân loại file: Core (sửa trực tiếp) thì dùng `view_file`. Reference (tài liệu, file > 300 dòng, log) thì bắt buộc dùng `headroom_compress` để nén lấy AST/Summary, chống nổ token.

## GIAI ĐOẠN 2: THIẾT KẾ BẢN KẾ HOẠCH (DRAFTING)

4. **Nguyên Tắc Bite-Sized (Cắt nhỏ):**
   - Mỗi Task phải theo chuẩn TDD: `(1) Thêm 1 API/UI Test -> (2) Chạy Test (Fail) -> (3) Viết logic tối thiểu -> (4) Pass -> (5) Refactor.`
   - Không chia Task theo chiều ngang (Sửa tất cả UI xong mới sửa Database). Phải chia theo chiều dọc (Vertical Slice - Sửa 1 tính năng từ UI xuống DB).

5. **DỪNG VÀ CHỜ PHÊ DUYỆT (Stop and Wait):**
   - Agent in ra `<thought_process>` chứa Bản phác thảo Kế hoạch.
   - BẮT BUỘC HỎI: *"Bạn có đồng ý với Implementation Plan này không? Nếu đồng ý, tôi sẽ tạo file Checklist."* VÀ DỪNG LẠI.

## GIAI ĐOẠN 3: LƯU TRỮ (PERSISTENCE)

6. **Lưu File Checklist (Cực kỳ Quan trọng):**
   - Chỉ khi được duyệt, dùng `write_to_file` để lưu bản kế hoạch vào file `.agents/memory/ACTIVE_TASK.md`.
   - Sử dụng định dạng Markdown Checkbox (`- [ ] Task 1`, `- [x] Task 2`) để các phiên làm việc sau (hoặc Agent khác) có thể check-in tiến độ.

7. **[BẮT BUỘC] Tạo FEATURE_CONTEXT.md — Nguồn dữ liệu cho IMPLEMENTATION GUARD:**
   - Copy template từ `.agents/memory/FEATURE_CONTEXT.template.md`
   - Điền thông tin từ spec và plan vừa tạo:
     - `[Tên Feature]` → tên feature
     - `**Spec:**` → path đến spec file vừa tạo
     - `## 🎯 Mục tiêu` → mục tiêu 1 câu từ spec
     - `## 🏗 Design Decisions` → extract từ approach đã approve trong brainstorm
     - `## 🚫 Constraints` → extract từ "Don't Do" trong spec
     - `## ✅ Implementation Checklist` → copy Tasks từ plan file
   - Lưu tại `.agents/memory/FEATURE_CONTEXT.md` (ghi đè nếu đã có)
   - Commit: `git add .agents/memory/FEATURE_CONTEXT.md && git commit -m "chore(agent): create FEATURE_CONTEXT for [feature-name]"`
   > ⚠️ **BẮT BUỘC.** Không tạo FEATURE_CONTEXT = IMPLEMENTATION GUARD sẽ chặn mọi session implement tiếp theo.

---

## 🚫 RED FLAGS - DỪNG VÀ BẮT ĐẦU LẠI
**Hệ thống sẽ BÁO ĐỘNG ĐỎ nếu bạn (Agent) có ý định:**
- Viết ngay lập tức toàn bộ mã nguồn (Code) cho người dùng thay vì viết Plan.
- Lập Plan nhưng LƯỜI BIẾNG không ghi vào file `.agents/memory/ACTIVE_TASK.md` mà chỉ chat ra màn hình.
- Phân chia task thành những cục quá to (ví dụ: "- [ ] Tạo toàn bộ hệ thống User Authentication").
- Quên hỏi ý kiến người dùng và tự ý chốt kiến trúc.
---
## CƠ CHẾ TỰ PHẢN BIỆN (SELF-REFLECTION MANDATORY)
TRƯỚC KHI in ra kết quả cuối cùng cho người dùng, Agent BẮT BUỘC phải tạo một <thought_process> ngầm để thực hiện **"Phiên toà Tự Phản Biện"**.
1. **Cross-Check (Kiểm chứng chéo):** Giải pháp mình vừa nghĩ ra có thực sự khớp 100% với mã nguồn gốc không? Hay do mình đang lấy râu ông nọ cắm cằm bà kia (Ảo giác)?
2. **Devil's Advocate (Đóng vai ác):** Nếu áp dụng giải pháp này, hệ thống có sập ở đâu không? (Ví dụ: vòng lặp vô hạn, quá tải Payload, thiếu Rate Limit, Memory Leak).
3. **React Pre-flight Check (Nếu lập kế hoạch/sinh code React):** Bắt buộc tự rà soát xem mình đã tuân thủ 100 điểm React Doctor chưa (dùng interface, không dùng `as`, arrow-function, tách magic numbers, tách UI/Logic).
   -> NẾU CHƯA: TỰ ĐỘNG QUAY LẠI BƯỚC SUY LUẬN VÀ SỬA ĐỔI BẢN KẾ HOẠCH TRƯỚC KHI OUTPUT.
4. **Output Gate (Cổng xuất dữ liệu):** CHỈ ĐƯỢC PHÉP in ra kết quả markdown cuối cùng cho người dùng SAU KHI phiên toà tự phản biện xác nhận giải pháp là Fact-based và an toàn. Nếu phát hiện lỗ hổng trong lúc tự phản biện, phải tự động quay lại bước suy luận và sửa logic ngầm.