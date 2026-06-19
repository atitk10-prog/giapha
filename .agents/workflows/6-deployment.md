---
description: Use when the product is fully developed, tested, and needs to be deployed to production (Vercel, AWS, Firebase, etc.) or configured for CI/CD pipelines.
---

# Quy trình Triển khai & Vận hành 6-Deployment (DevOps V2.0)

Workflow này chuyển đổi hệ thống từ môi trường Development sang Production một cách chuyên nghiệp, tập trung vào tính tự động hóa (CI/CD) và bảo mật dữ liệu.

## GIAI ĐOẠN 1: THU THẬP YÊU CẦU & KIẾN TRÚC CLOUD

1. **Khởi tạo Bối cảnh (Context & Skill Matching):**
   - **[ANTI-AMNESIA]:** Yêu cầu Agent đọc `docs/CONTEXT.md` hoặc `README.md` để xem Tech Stack của dự án là gì.
   - Truy xuất `.agents/antigravity-awesome-skills/CATALOG.md` bằng `grep_search` để tìm skill tương ứng với nền tảng Cloud (VD: tìm `aws`, `vercel`, `firebase`, `github-actions`).

2. **Kiểm tra Tiền triển khai (Pre-flight Check):**
   - Rà soát mã nguồn xem có thông tin nhạy cảm (API Keys, Passwords) bị hardcode hay không. 
   - Hướng dẫn người dùng chạy bộ Unit/E2E test (nếu có) bằng `run_command` để đảm bảo code sạch.

3. **Thiết kế & Phê duyệt (Stop and Wait):**
   - Agent in ra `<thought_process>` bao gồm: Kiến trúc Cloud dự kiến (App lưu ở đâu, DB lưu ở đâu) và Các công đoạn CI/CD.
   - **BẮT BUỘC HỎI:** *"Bạn có đồng ý với sơ đồ triển khai này không? Nếu đồng ý, xin vui lòng chuẩn bị các biến môi trường (ENV) cần thiết."* VÀ DỪNG LẠI.

## GIAI ĐOẠN 2: THỰC THI (EXECUTION)

4. **Thiết lập Tự động hóa (CI/CD Automation):**
   - Thay vì hướng dẫn build thủ công, hãy tạo các file cấu hình như `.github/workflows/deploy.yml` hoặc `vercel.json` để hệ thống tự động hóa.
   - Hỗ trợ người dùng thiết lập các Secrets an toàn trên nền tảng Cloud.

5. **Cấu hình Môi trường & Bảo mật:**
   - Đảm bảo các quy tắc truy cập Database (CORS, Security Rules) được cấu hình chặt chẽ (Chỉ cho phép domain production).

## GIAI ĐOẠN 3: HẬU KIỂM & ĐỒNG BỘ

6. **Kiểm tra Môi trường thật (Live Verification):**
   - Yêu cầu người dùng truy cập Live URL và thực hiện một thao tác cơ bản để xác nhận hệ thống chạy ổn định.

7. **Lưu trữ Trạng thái (Post-deployment Docs):**
   - Cập nhật Live URL, danh sách các Cloud Services đang sử dụng, và vị trí quản lý CI/CD vào file `CONTEXT.md` hoặc `README.md`.

---

## 🚫 RED FLAGS - DỪNG VÀ BẮT ĐẦU LẠI
**Hệ thống sẽ BÁO ĐỘNG ĐỎ nếu bạn (Agent) có ý định:**
- Hướng dẫn người dùng đưa thẳng file `.env` thật (chứa Credentials) lên Git repository.
- Thiết lập quy tắc Database (như Firebase Rules) mở toang cửa: `allow read, write: if true;`.
- Bỏ qua bước kiểm tra pre-flight và đòi setup CI/CD ngay lập tức.
- Yêu cầu thực thi các thao tác tốn phí trên Cloud mà KHÔNG thông qua bước hỏi ý kiến (Stop and Wait).
- Quên cập nhật Live URL vào tài liệu dự án sau khi deploy thành công.

---
## CƠ CHẾ TỰ PHẢN BIỆN (SELF-REFLECTION MANDATORY)
TRƯỚC KHI in ra kết quả cuối cùng cho người dùng, Agent BẮT BUỘC phải tạo một <thought_process> ngầm để thực hiện **"Phiên toà Tự Phản Biện"**.
1. **Cross-Check (Kiểm chứng chéo):** Giải pháp mình vừa nghĩ ra có thực sự khớp 100% với mã nguồn gốc không? Hay do mình đang lấy râu ông nọ cắm cằm bà kia (Ảo giác)?
2. **Devil's Advocate (Đóng vai ác):** Nếu áp dụng giải pháp này, hệ thống có sập ở đâu không? (Ví dụ: vòng lặp vô hạn, quá tải Payload, thiếu Rate Limit).
3. **Output Gate (Cổng xuất dữ liệu):** CHỈ ĐƯỢC PHÉP in ra kết quả markdown cuối cùng cho người dùng SAU KHI phiên toà tự phản biện xác nhận giải pháp là Fact-based và an toàn. Nếu phát hiện lỗ hổng trong lúc tự phản biện, phải tự động quay lại bước suy luận và sửa logic ngầm.
