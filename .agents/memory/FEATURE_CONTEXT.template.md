# FEATURE_CONTEXT — [Tên Feature]
**Spec:** DOCs/superpowers/specs/YYYY-MM-DD-[topic]-design.md
**Status:** IN_PROGRESS
**Tạo lúc:** YYYY-MM-DD | **Cập nhật lần cuối:** YYYY-MM-DD
*(Lưu ý: Checklist theo dõi công việc được tích hợp trực tiếp tại section Implementation Checklist bên dưới. Không sử dụng ACTIVE_TASK.md)*

---

## 🎯 Mục tiêu (1 câu duy nhất)
[Mô tả feature làm gì, cho ai, giải quyết vấn đề gì]

## 🏗 Design Decisions
> Những quyết định này đã được USER APPROVE. KHÔNG tự ý thay đổi khi code.

- **[D1]** [Quyết định] — *Lý do: [tại sao chọn cách này]*
- **[D2]** [Quyết định] — *Lý do: [tại sao chọn cách này]*
- **[D3]** [Quyết định] — *Lý do: [tại sao chọn cách này]*

## 🚫 Constraints (Don't Do List)
- KHÔNG tự sửa bất kỳ logic nào nằm ngoài 'Design Decisions' — vì đảm bảo tuân thủ thiết kế và tránh phá vỡ hệ thống
- **[React Doctor 100/100 Hard-Rules]** NẾU viết code React, TUYỆT ĐỐI TUÂN THỦ:
  - **Types:** Chỉ dùng `interface`, KHÔNG dùng `type`.
  - **Components:** 100% sử dụng Arrow Functions (`const Cmp = () => {}`).
  - **Casting:** Tuyệt đối KHÔNG ép kiểu bằng `as`.
  - **Magic Numbers:** Không code cứng số liệu/chuỗi. Đưa vào `constants.ts` (định dạng `SCREAMING_SNAKE_CASE_MS/_PX`).
  - **Booleans:** Ép kiểu bằng `Boolean(x)`, tuyệt đối không dùng `!!x`.
  - **Architecture:** Tách 100% logic ra Hook riêng, UI file chỉ chứa JSX. Không vượt quá 150 lines/file.
  - **Comments:** Chỉ cho phép `// HACK: <lý do>`. Xóa mọi comment khác.
  - KHÔNG [hành động cụ thể] — vì [lý do]

## ✅ Implementation Checklist
- [ ] Phase 1: [Tên]
  - [ ] Task 1.1: [mô tả cụ thể + file target]
  - [ ] Task 1.2: [mô tả cụ thể + file target]
- [ ] Phase 2: [Tên]
  - [ ] Task 2.1: [mô tả cụ thể + file target]

## 📝 Done Log
| Task | Cách làm | Lý do chọn cách này |
|------|----------|---------------------|
| - | - | - |
