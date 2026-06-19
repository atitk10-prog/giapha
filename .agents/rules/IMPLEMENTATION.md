---
trigger: always_on
---

# IMPLEMENTATION GUARD — Design Continuity Enforcer

Mục đích: Ngăn agent code mâu thuẫn với design decisions đã được approve.
Áp dụng: Mọi response có chứa code (bất kể task type).

---

## 🔴 HARD GATE — Bắt buộc thực hiện TRƯỚC KHI viết code

### Bước 1 — Kiểm tra FEATURE_CONTEXT

Dùng `view_file` đọc `.agents/memory/FEATURE_CONTEXT.md`:

**Kết quả A — Tồn tại, Status = IN_PROGRESS:**
→ Thực hiện Bước 2 ngay.

**Kết quả B — Tồn tại, Status = DONE:**
→ Xóa file bằng lệnh xóa file thích hợp.
→ Ghi vào `ACTIVE_TASK.md`: feature tương ứng đã COMPLETE.
→ Tiếp tục response bình thường (không cần Bước 2).

**Kết quả C — Không tồn tại:**
→ Xác định loại task:
  - Task nhỏ (sửa ≤1 file, không tạo API mới, không thay đổi architecture) → bỏ qua, tiếp tục bình thường.
  - Task lớn (≥2 files, feature mới, refactor) → trả lời:
    *"Task này cần FEATURE_CONTEXT trước khi code. Chạy /3-plan-writing để tạo spec và context file."*
    **DỪNG LẠI. Không code.**

---

### Bước 2 — Pin Design Decisions (MANDATORY cho IN_PROGRESS)

Copy nguyên section `## 🏗 Design Decisions` từ FEATURE_CONTEXT.md.
Paste vào đầu response dưới dạng blockquote TRƯỚC khi viết bất kỳ dòng code nào:

> **[PINNED DECISIONS — Feature: {tên feature}]**
> - [D1] {quyết định} — *Lý do: {lý do}*
> - [D2] {quyết định} — *Lý do: {lý do}*

⚠️ **VI PHẠM NGHIÊM TRỌNG:** Response có code mà không có blockquote ở trên.
Nếu phát hiện vi phạm → dừng, thêm blockquote, rồi mới tiếp tục.

---

### Bước 3 — Cross-check & Update sau mỗi task

Sau khi hoàn thành mỗi task trong checklist:
1. Verify code không vi phạm section `## 🚫 Constraints` trong FEATURE_CONTEXT.
2. Tick checkbox tương ứng trong FEATURE_CONTEXT.md.
3. Ghi vào `## 📝 Done Log`: cách làm + lý do chọn cách đó.
4. Nếu tất cả checkbox đã tick → đổi `**Status:** IN_PROGRESS` → `**Status:** DONE`.
