---
description: Use when receiving a task to scan for malware, perform security assessment, or audit source code. Enforces safe handling of sensitive data.
---

# Quy trình Bảo mật & Kiểm toán 4-Security (V2.0)

Workflow chuyên dụng cho việc rà soát bảo mật mã nguồn (Security Audit), phát hiện mã độc (Malware Analysis) và xử lý dữ liệu nhạy cảm. 

## GIAI ĐOẠN 1: NẠP KỸ NĂNG & RÀO CHẮN AN TOÀN

1. **Kích hoạt Rào Chắn (Sandbox Mode):**
   - **BẮT BUỘC:** Trong suốt Giai đoạn 1 và 2, Agent **CẤM TUYỆT ĐỐI** việc gọi lệnh `run_command` để thực thi file lạ hoặc cài cắm thư viện (`npm install`, `pip install`). Mọi thao tác quét phải là phân tích tĩnh (Static Analysis) bằng `view_file` hoặc `grep_search`.

2. **Kích hoạt Kỹ năng Bảo mật:**
   - Dùng `grep_search` để quét `CATALOG.md` với các tag như `security`, `scanner`, `audit` để lấy best practices.

## GIAI ĐOẠN 2: THỰC THI KIỂM TOÁN (AUDIT EXECUTION)

3. **Quét 3 Trụ Cột Bảo Mật (3-Pillar Scan):**
   - **Pillar 1 (Credentials):** Quét sự rò rỉ API Keys, Passwords, Tokens bị hardcode trong source file. Kiểm tra file `.env` có bị lộ trong Git không.
   - **Pillar 2 (Dependencies):** Đọc `package.json`, `requirements.txt` để phát hiện các thư viện quá cũ hoặc có chứa CVE nguy hiểm.
   - **Pillar 3 (Code Logic & Injection):** Kiểm tra các Controller/API xem dữ liệu từ client có được Validate/Sanitize trước khi đưa vào Database (tránh SQLi, XSS) hay không.

4. **DỪNG VÀ CHỜ PHÊ DUYỆT (Stop and Wait):**
   - Sau khi scan, BẮT BUỘC in ra `<thought_process>` chứa **Bảng Báo Cáo Lỗ Hổng** (Phân loại: Critical, High, Low).
   - Hỏi người dùng: *"Tôi đã phát hiện [X] lỗ hổng. Bạn muốn tôi tiến hành vá lỗi bảo mật nào trước?"* VÀ DỪNG LẠI.

## GIAI ĐOẠN 3: VÁ LỖI & LƯU TRỮ TRUYỀN THUYẾT

5. **Sửa Code Khoanh Vùng (Safe Patching):**
   - Khi được duyệt, tiến hành fix code. 
   - [ANTI-AMNESIA] Bắt buộc dùng `grep_search` để quét xem component định sửa đang ảnh hưởng tới đâu. Fix lỗi bảo mật không được làm hỏng tính năng (Break logic).

6. **Lưu Lịch Sự Cố (Security Ledger):**
   - Các lỗ hổng đã được xử lý BẮT BUỘC phải lưu vào file `.agents/security.md`.
   - Cấu trúc: `- [Date] **Issue:** ... -> **Fix:** ...`

---

## 🚫 RED FLAGS - DỪNG VÀ BẮT ĐẦU LẠI
**Hệ thống sẽ BÁO ĐỘNG ĐỎ nếu bạn (Agent) có ý định:**
- In trực tiếp một đoạn API Key, Mật khẩu, hoặc Mnemonic Token thật ra màn hình chat (Vi phạm Data Leakage).
- Dùng `run_command` để chạy thử một đoạn script không rõ nguồn gốc trước khi kiểm toán tĩnh.
- Bỏ qua bước "Dừng và Chờ Phê Duyệt" mà tự ý chèn các thư viện mã hóa nặng nề vào app của người dùng.
- Tự biện hộ rằng "Cái này là code frontend/test nên không cần che giấu credentials".

---
## CƠ CHẾ TỰ PHẢN BIỆN (SELF-REFLECTION MANDATORY)
TRƯỚC KHI in ra kết quả cuối cùng cho người dùng, Agent BẮT BUỘC phải tạo một <thought_process> ngầm để thực hiện **"Phiên toà Tự Phản Biện"**.
1. **Cross-Check (Kiểm chứng chéo):** Giải pháp mình vừa nghĩ ra có thực sự khớp 100% với mã nguồn gốc không? Hay do mình đang lấy râu ông nọ cắm cằm bà kia (Ảo giác)?
2. **Devil's Advocate (Đóng vai ác):** Nếu áp dụng giải pháp này, hệ thống có sập ở đâu không? (Ví dụ: vòng lặp vô hạn, quá tải Payload, thiếu Rate Limit).
3. **Output Gate (Cổng xuất dữ liệu):** CHỈ ĐƯỢC PHÉP in ra kết quả markdown cuối cùng cho người dùng SAU KHI phiên toà tự phản biện xác nhận giải pháp là Fact-based và an toàn. Nếu phát hiện lỗ hổng trong lúc tự phản biện, phải tự động quay lại bước suy luận và sửa logic ngầm.
