# Các Toán Tử & Mẫu Truy Vấn Nâng Cao (Advanced Dorks)

Tài liệu này cung cấp các kỹ thuật chuyên sâu và các mẫu Google Dorks (GHDB - Google Hacking Database) thường được sử dụng trong các cuộc điều tra bảo mật hoặc nghiên cứu cấp cao.

## 1. Dork Chaining (Chuỗi Toán Tử)

Việc kết hợp (chaining) các toán tử giúp loại bỏ hàng triệu kết quả rác và tìm đến chính xác mục tiêu:

- **Giới hạn thời gian (Time-bound Dorks)**
  `daterange:` (định dạng Julian date) hoặc dùng công cụ trên Google. Kết hợp với dork để tìm lỗ hổng mới.
  *Ví dụ:* `site:github.com intext:"sk_test_" daterange:2459000-2460000`

- **Khoảng cách từ khóa (AROUND)**
  Tìm hai từ khóa cách nhau không quá X từ. Cực kỳ hiệu quả để tìm tài liệu hoặc báo cáo cụ thể.
  *Ví dụ:* `"confidential" AROUND(5) "financial report" filetype:pdf`

## 2. Truy Xuất Cơ Sở Dữ Liệu & Bản Sao Lưu (Databases & Backups)

- **SQL Dumps & Backups:**
  ```text
  "index of" "database.sql"
  "index of" "backup.tar.gz" OR "backup.zip"
  ext:sql intext:"INSERT INTO" AND intext:"password"
  ```
- **Log Files:**
  ```text
  ext:log "Software: Microsoft Internet Information Services"
  allintext:"username" "password" ext:log
  ```

## 3. Thiết Bị IoT & Camera An Ninh Mở

*(Lưu ý: Chỉ phục vụ mục đích nghiên cứu, tuyệt đối không xâm nhập trái phép)*
- **Webcams / IP Cams:**
  ```text
  intitle:"webcamXP 5"
  inurl:"view/view.shtml"
  intitle:"Live View / - AXIS"
  ```
- **Máy in qua mạng (Printers):**
  ```text
  intitle:"Network Print Server" filetype:shtm
  ```

## 4. Tài Liệu Nội Bộ & Mật Khẩu Khách Hàng (Sensitive Docs)

- **Danh sách mật khẩu (Passwords/Credentials):**
  ```text
  filetype:xls inurl:"email.xls"
  intitle:"index of" "passwords.txt"
  ext:env "DB_PASSWORD"
  ```
- **Tài liệu M&A, Chiến lược kinh doanh:**
  ```text
  intitle:"Strictly Confidential" OR intitle:"Do Not Distribute" filetype:pdf OR filetype:docx
  ```

## 5. Bỏ Qua Giới Hạn (Bypassing Limits)

Khi Google chặn vì "Unusual traffic" (Captcha):
- Khuyên người dùng thay thế khoảng trắng bằng `%20` hoặc sử dụng các công cụ ẩn danh (Tor/VPN).
- Chia nhỏ truy vấn: Thay vì `A OR B OR C`, hãy thực hiện 3 lệnh tìm kiếm riêng biệt.
- Sử dụng công cụ tương đương: Shodan (cho thiết bị/IP), Censys, hoặc DuckDuckGo (hỗ trợ cú pháp tìm kiếm tương tự nhưng ít bị Captcha hơn).
