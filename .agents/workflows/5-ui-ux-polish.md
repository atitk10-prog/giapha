---
description: Use when the product's core logic is complete and you need to refine the user interface, add animations, and improve user experience (UX) before launch.
---

# Quy trình Trau chuốt Giao diện & Trải nghiệm 5-UI-UX-Polish (V2.0)

Workflow này hướng dẫn hệ thống AI đóng vai trò là một UI/UX Designer và Frontend Expert để chấm điểm (Audit) và đánh bóng (Polish) giao diện người dùng.

## GIAI ĐOẠN 1: THU THẬP BỐI CẢNH & KHÁM NGHIỆM THỊ GIÁC

1. **Khởi tạo Kỹ Năng & Bối cảnh:**
   - **[ANTI-AMNESIA]:** Yêu cầu Agent đọc `docs/CONTEXT.md` hoặc `README.md` để nắm được bộ công cụ UI (Tailwind, Shadcn, Material, v.v.).
   - Truy xuất `.agents/antigravity-awesome-skills/CATALOG.md` bằng `grep_search` để tìm skill như `uxui-principles`, `ui-pattern`, `gsap`, `tailwind`.

2. **Yêu cầu Đầu vào Trực quan (Visual Input):**
   - Không được "tưởng tượng" ra UI từ code. Hãy yêu cầu người dùng cung cấp **Ảnh chụp màn hình (Screenshot)** của trang cần sửa. 
   - (Tùy chọn) Nếu hệ thống có skill `browser-automation` hoặc `screenshots`, Agent có thể chủ động đề xuất chụp ảnh ứng dụng.

## GIAI ĐOẠN 2: CHẤM ĐIỂM (UI/UX AUDIT) VÀ ĐỀ XUẤT

3. **Thực hiện UX/UI Audit:**
   Dựa trên code và ảnh chụp màn hình, Agent phân tích theo 4 cột trụ:
   - **Typography (Chữ):** Phân cấp Font Size đã tốt chưa? Font chữ có bị lỗi thời không?
   - **Color & Contrast (Màu sắc):** Độ tương phản có đạt chuẩn WCAG không? Có dùng Design Tokens không hay đang hardcode hex color?
   - **Spacing & Layout:** Căn lề (Padding/Margin) có theo hệ thống lưới (Grid/Flex) nhất quán không?
   - **Motion & Feedback:** Các tương tác (Hover, Click, Loading) đã có phản hồi chưa?

4. **DỪNG VÀ CHỜ PHÊ DUYỆT (Stop and Wait):**
   - BẮT BUỘC in ra `<thought_process>` chứa **Báo Cáo UI/UX Audit** (Chỉ ra những điểm xấu cần sửa).
   - Hỏi người dùng: *"Dựa trên báo cáo trên, tôi đề xuất sửa [A, B, C]. Bạn có đồng ý cho tôi tiến hành áp dụng các thay đổi này vào CSS/Component không?"* VÀ DỪNG LẠI.

## GIAI ĐOẠN 3: THỰC THI & HOÀN TẤT

5. **Áp dụng Hiệu ứng & Refactor (Execution):**
   - Khi được duyệt, tiến hành sửa code đúng phạm vi.
   - Thêm Micro-animations, Hover states, Loading skeletons. Đảm bảo chuyển động mượt mà và không làm giảm hiệu năng (fps).

6. **Kiểm tra Đa Thiết Bị (Responsive Verify):**
   - Nhắc người dùng kiểm tra lại giao diện trên màn hình Mobile. Xóa các code CSS tạm thời/rác sinh ra trong quá trình sửa đổi.

---

## 🚫 RED FLAGS - DỪNG VÀ BẮT ĐẦU LẠI
**Hệ thống sẽ BÁO ĐỘNG ĐỎ nếu bạn (Agent) có ý định:**
- Sửa đổi hàng loạt class Tailwind / CSS mà không yêu cầu xem Screenshot hoặc bỏ qua bước lập Báo Cáo Audit.
- Nhồi nhét hàng tá hiệu ứng GSAP bay lượn lóa mắt vào một ứng dụng mang tính nghiêm túc (làm giảm tốc độ load).
- Sửa màu sắc thành các tông màu chói lọi (như neon) gây nhức mắt, không tuân thủ Accessibility (A11y).
- Bỏ qua bước "Dừng và Chờ Phê Duyệt" ở Giai đoạn 2 mà tự ý thay đổi giao diện toàn cục.

---
## CƠ CHẾ TỰ PHẢN BIỆN (SELF-REFLECTION MANDATORY)
TRƯỚC KHI in ra kết quả cuối cùng cho người dùng, Agent BẮT BUỘC phải tạo một <thought_process> ngầm để thực hiện **"Phiên toà Tự Phản Biện"**.
1. **Cross-Check (Kiểm chứng chéo):** Giải pháp mình vừa nghĩ ra có thực sự khớp 100% với mã nguồn gốc không? Hay do mình đang lấy râu ông nọ cắm cằm bà kia (Ảo giác)?
2. **Devil's Advocate (Đóng vai ác):** Nếu áp dụng giải pháp này, hệ thống có sập ở đâu không? (Ví dụ: vòng lặp vô hạn, quá tải Payload, thiếu Rate Limit).
3. **Output Gate (Cổng xuất dữ liệu):** CHỈ ĐƯỢC PHÉP in ra kết quả markdown cuối cùng cho người dùng SAU KHI phiên toà tự phản biện xác nhận giải pháp là Fact-based và an toàn. Nếu phát hiện lỗ hổng trong lúc tự phản biện, phải tự động quay lại bước suy luận và sửa logic ngầm.
