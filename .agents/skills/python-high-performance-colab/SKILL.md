# python-high-performance-colab

## Mô tả (Description)
Kỹ năng tối ưu hóa và cấu hình Python chạy trên môi trường Google Colab / Worker, đặc biệt là các kỹ thuật Bypass (Lách luật) không dùng Service Account JSON của GCP để tương tác với Firebase/Firestore, kết hợp tối ưu hóa hiệu năng bằng Numba C-Engine.

## Triggers
- `python colab`
- `google colab auth`
- `firebase admin colab`
- `bypass service account`
- `gcp organization policy`
- `ADC`
- `firestore rest api`
- `numba backtest`

## 🧠 Kiến thức cốt lõi (Core Knowledge)
Khi GCP Organization Policy cấm tạo **Service Account** (File JSON), lập trình viên không thể sử dụng `credentials.Certificate('service-account.json')` để kết nối Firebase Admin SDK. Dưới đây là 2 kỹ thuật xử lý triệt để:

### Kỹ thuật 1: Giao thức Application Default Credentials (ADC)
Dành cho Colab (Chạy thủ công). Sử dụng tài khoản Gmail cá nhân để cấp quyền tạm thời, kế thừa Full Admin Rights.
- **Ưu điểm:** Dùng được 100% sức mạnh của thư viện `firebase_admin`. Không sinh ra file JSON.
- **Nhược điểm:** Phải bấm Popup bằng tay, không chạy Cronjob 100% tự động được.

```python
try:
    from google.colab import auth
    import firebase_admin
    from firebase_admin import credentials, firestore

    print("🔑 Đang mở Popup xác thực Google Account...")
    auth.authenticate_user()
    
    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {'projectId': 'YOUR_PROJECT_ID'})
        
    db = firestore.client()
    print("🔗 Kết nối Firebase Firestore bằng quyền Admin thành công!")
except ImportError:
    print("⚠️ CẢNH BÁO: Phải chạy trên Google Colab.")
```

### Kỹ thuật 2: REST API Serverless (Zero-Auth)
Dành cho các Backend Worker tự động (Bot chạy VPS 24/7). Không cần xác thực, chỉ cần Firebase Security Rule cho phép truy cập.
- **Yêu cầu:** Firebase Rules cho bảng `job_queue` phải có `allow read, write: if true;` hoặc sử dụng ID token nặc danh.
- **Hiệu năng:** Siêu nhẹ, tiết kiệm RAM.

```python
import requests
FIREBASE_PROJECT_ID = "YOUR_PROJECT_ID"

# Đọc Firestore qua REST
def get_pending_job():
    url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/backtest_jobs?pageSize=100"
    resp = requests.get(url, timeout=10)
    data = resp.json()
    # Tự parse JSON...
    return data

# Ghi Firestore qua REST (PATCH)
def update_job_status(job_id, update_dict):
    url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/backtest_jobs/{job_id}?"
    # Payload & Mask parameters logic...
    requests.patch(full_url, json=payload, timeout=10)
```

## ⚡ Tối ưu Hiệu năng Toán học (Numba C-Engine)
Khi viết các thuật toán Backtest nặng hoặc quét Grid Search hàng chục ngàn tổ hợp, BẮT BUỘC phải sử dụng `@numba.njit` để biên dịch hàm Python sang C.
- Luôn sử dụng kiểu dữ liệu `np.ndarray(dtype=np.float64)` khi truyền vào hàm Numba.
- Không truyền DataFrame hay cấu trúc Object của Python vào hàm `njit`.

```python
import numba
import numpy as np

@numba.njit(nogil=True, fastmath=True, cache=True)
def fast_supertrend_backtest(high, low, close, factor, period, ...):
    n = len(close)
    # Triển khai thuật toán tính toán mảng O(n) siêu nhanh tại đây
    # ...
    return win_rate, total_trades, profit_factor
```

## 📝 Best Practices
1. Luôn sử dụng **Cloudinary** để đẩy các file JSON to lớn (>1MB) lên Cloud, sau đó ghi URL (Link trả về) xuống Firestore để tránh giới hạn kích thước Document của Firebase.
2. Vòng lặp Worker (REST) nên có `time.sleep(2)` để tránh dính Rate Limit của Google API.
