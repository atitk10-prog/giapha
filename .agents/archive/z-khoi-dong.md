---
description: Khởi động hệ thống Trade Agents (UI Server & Cron Jobs)
---

# MASTER TASK FOR ANTIGRAVITY AGENT: Khởi động hệ thống Trade Agents

Quy trình này sẽ khởi động hai thành phần cốt lõi của hệ thống Trade Agents.

1. **UI Server**: Chạy giao diện Dashboard tại http://localhost:3000
2. **Cron Jobs**: Chạy các Agent ngầm (Market Scanner, Swarm Agents, Trailing Manager, Self-Reflection)

## Task 1: Khởi động UI Server
Chạy lệnh sau dưới dạng background task:
```powershell
node src/ui_server.js
```

## Task 2: Khởi động Cron Jobs
Chạy lệnh sau dưới dạng background task:
```powershell
node src/cron_jobs.js
```

**Lưu ý:**
- Đảm bảo cả hai tiến trình được chạy nền.
- Xác nhận với người dùng rằng hệ thống đã khởi động thành công và cung cấp link truy cập Dashboard: `http://localhost:3000`.
