# Hướng Dẫn Sử Dụng - Hệ Thống Quản Lý Viện Dưỡng Lão FDC

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu Hệ Thống
- Node.js phiên bản 18 trở lên
- Trình duyệt hiện đại (Chrome, Firefox, Edge)
- Kết nối Internet ổn định

### Cài Đặt & Chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy ứng dụng (môi trường development)
npm run dev

# 3. Truy cập: http://localhost:3000
```

### Đăng Nhập
- Sử dụng tài khoản được cấp bởi quản trị viên
- Mỗi vai trò (Bác sĩ, Điều dưỡng, Trưởng tầng) có giao diện riêng

---

## 📋 Chức Năng Chính

### 1. **Quản Lý Cư Dân** (Residents)
- Xem danh sách cư dân theo phòng/tầng
- Thêm/sửa thông tin cư dân mới
- Theo dõi lịch sử bệnh án, dị ứng
- Quản lý đánh giá sức khỏe định kỳ

### 2. **Theo Dõi Đường Huyết** (Diabetes)
- Nhập số đo đường huyết 4 lần/ngày (Sáng, Trưa, Chiều, Tối)
- Ghi nhận liều Insulin
- Xem biểu đồ xu hướng
- Cảnh báo đường huyết cao

### 3. **Theo Dõi Cân Nặng** (Weight Tracking)
- Cân hàng tháng
- Tính chỉ số BMI tự động
- Phân tích xu hướng tăng/giảm cân
- In phiếu theo dõi cân nặng

### 4. **Thủ Thuật Y Tế** (Procedures)
- Ghi nhận thủ thuật: thay băng, thông tiểu, hút đờm...
- Tính phí tự động theo bảng giá
- Xuất báo cáo tháng

### 5. **Giao Ban Ca** (Shift Handover)
- Tạo biên bản giao ban giữa các ca (Sáng → Chiều → Tối)
- Ghi chú công việc cần theo dõi
- In biên bản giao ban

### 6. **Báo Cáo Sự Cố** (Incidents)
- Ghi nhận sự cố: té ngã, sai sót thuốc...
- Phân loại mức độ nghiêm trọng
- Theo dõi xử lý

### 7. **Quản Lý Tài Chính** (Finance)
- Theo dõi thu chi hàng tháng
- Quản lý công nợ cư dân
- Báo cáo tài chính

### 8. **Kho Thuốc & Vật Tư** (Inventory)
- Quản lý tồn kho
- Cảnh báo hết hạn
- Nhập/xuất kho

---

## 🖨️ In Phiếu

Các phiếu có thể in PDF:
- **Phiếu theo dõi thủ thuật**: Procedures → Chọn cư dân → Nút In
- **Phiếu theo dõi cân nặng**: Weight → Chọn cư dân → Nút In
- **Biên bản giao ban**: Shift Handover → Nút In

---

## 👥 Vai Trò Người Dùng

| Vai Trò | Quyền Truy Cập |
|---------|----------------|
| **Bác sĩ** | Xem cảnh báo y tế, danh sách chăm sóc đặc biệt |
| **Điều dưỡng** | Nhập liệu hàng ngày (đường huyết, vital signs, thủ thuật) |
| **Trưởng tầng** | Quản lý nhân sự, giao ban, tổng hợp báo cáo |
| **Kế toán** | Quản lý tài chính, báo cáo thu chi |
| **Admin** | Toàn quyền hệ thống |

---

## 🔔 Lưu Ý Quan Trọng

- ✅ Nhập dữ liệu **đầy đủ và chính xác** để đảm bảo theo dõi hiệu quả
- ✅ Kiểm tra **cảnh báo y tế** hàng ngày từ Dashboard
- ✅ Backup dữ liệu được tự động thực hiện qua Supabase
- ✅ Sử dụng **máy tính bảng (tablet)** để trải nghiệm tối ưu

---

## 📞 Hỗ Trợ

Liên hệ quản trị viên hệ thống khi gặp vấn đề kỹ thuật.

---

**Phát triển bởi FDC Team** | Phiên bản 1.0 | Cập nhật T12/2024
