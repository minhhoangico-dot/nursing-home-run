# Hướng Dẫn Sử Dụng - Hệ Thống Quản Lý Viện Dưỡng Lão FDC

## Bắt Đầu Nhanh

### Yêu Cầu

- Node.js 18 trở lên
- Trình duyệt hiện đại: Chrome, Edge, Firefox
- Tài khoản người dùng do quản trị viên cấp

### Chạy Ứng Dụng

```bash
npm install
npm run dev
```

Mở địa chỉ local do Vite hiển thị trong terminal.

## Đăng Nhập

1. Mở `/login`.
2. Chọn hoặc nhập tài khoản được cấp.
3. Sau khi đăng nhập, hệ thống chuyển vào `/dashboard`.

Vai trò đang dùng:

- `ADMIN`: toàn quyền hệ thống
- `DOCTOR`: hồ sơ, theo dõi, đơn thuốc, cảnh báo lâm sàng
- `SUPERVISOR`: điều phối, sự cố, theo dõi vận hành
- `NURSE`: nhập liệu chăm sóc, theo dõi ngày, thủ thuật, thuốc
- `ACCOUNTANT`: tài chính và công nợ
- `CAREGIVER`: các luồng chăm sóc được cấp quyền

## Màn Hình Hôm Nay

Route: `/dashboard`

- Điều dưỡng thấy NCT chưa nhập chỉ số, thủ thuật hôm nay, và lối tắt nhập liệu.
- Bác sĩ thấy cảnh báo lâm sàng, thuốc sắp hết, và đơn thuốc đang dùng.
- Trưởng tầng thấy sự cố mới, sự cố đang xử lý, và tình trạng nhập liệu.
- Kế toán thấy NCT đang nợ, dịch vụ chưa chốt, và phát sinh trong ngày.

## Hồ Sơ NCT

Routes: `/residents`, `/residents/:id`

- Xem danh sách NCT, lọc theo phòng/tầng/trạng thái.
- Mở hồ sơ để xem thông tin cá nhân, y tế, theo dõi, đơn thuốc, và tài chính.
- Nếu module ở chế độ chỉ đọc, các thao tác tạo/sửa sẽ bị ẩn hoặc khóa.

## Thuốc Và Đơn Thuốc

Route chính: `/medications`

- Xem thuốc đang dùng trên toàn cơ sở.
- Xem cảnh báo thuốc sắp hết và đơn đang tạm ngưng.
- In danh sách thuốc hoặc xuất CSV.
- Mở nhanh hồ sơ NCT từ từng dòng thuốc.

Route kê đơn theo NCT:

- `/residents/:residentId/medications/new`
- `/residents/:residentId/medications/:prescriptionId`
- `/residents/:residentId/medications/:prescriptionId/duplicate`

## Theo Dõi Ngày

Route: `/daily-monitoring`

- Nhập chỉ số sinh hiệu, đường huyết, nhiệt độ, SpO2.
- Bác sĩ và điều dưỡng dùng dữ liệu này cho cảnh báo lâm sàng trên Dashboard.

## Thủ Thuật

Route: `/procedures`

- Ghi nhận tiêm, truyền dịch, sonde dạ dày, thông tiểu, rửa bàng quang, đo đường huyết, đo huyết áp, oxy, và thay băng.
- Dữ liệu thủ thuật được tổng hợp vào Dashboard theo ngày.

## Sự Cố Và An Toàn

Route: `/incidents`

- Ghi nhận sự cố, mức độ nghiêm trọng, vị trí, mô tả, xử lý ban đầu.
- Trưởng tầng theo dõi sự cố mới và sự cố đang xử lý trên Dashboard.

## Tài Chính

Route: `/finance` và tab tài chính trong hồ sơ NCT

- Theo dõi dịch vụ cố định, dịch vụ phát sinh, công nợ, và tiền thuốc.
- Tiền thuốc được tính từ đơn thuốc Active, số lượng cấp phát, và giá thuốc trong danh mục.
- Dòng tiền thuốc thiếu giá hoặc thiếu số lượng sẽ hiển thị là tạm tính.
- Dịch vụ thêm nhanh trong hồ sơ NCT có mô tả nguồn để truy vết.

## Cài Đặt

Route: `/settings`

- Cập nhật thông tin cơ sở và logo.
- Cấu hình quyền module theo vai trò.
- Module đang dùng khóa camel-case, ví dụ `dailyMonitoring`, `weightTracking`, `medications`.

## In Biểu Mẫu

Route: `/forms`

- In phiếu thủ thuật.
- In phiếu theo dõi cân nặng.
- In các mẫu biểu vận hành đang được cấu hình.

## Kiểm Tra Trước Khi Bàn Giao

```bash
npm test
npm run build
npx tsc --noEmit
npm audit --omit=dev
```
