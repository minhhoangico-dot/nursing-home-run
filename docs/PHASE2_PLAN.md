# Phase 2 — Hoàn thiện module Tiếp nhận NCT

**Tiền đề**: Phase 1 đã ship (4 bước wizard + xếp giường + tải hợp đồng `.docx` cơ bản). Phase 2 chỉ làm sau khi anh đã nhập tay toàn bộ NCT đang ở viện và xác định gap thực tế.

## Trạng thái Phase 1 (đã làm)

- Wizard 4 bước: NCT → Bảo trợ → Phòng+Cấp độ (xếp giường thật) → Hợp đồng.
- Sinh hợp đồng `.docx` qua docxtemplater, layout 100% giống mẫu pháp lý.
- 16 placeholder điền sẵn: số HĐ, ngày ký (3 vị trí), tên NCT (3 vị trí), CCCD/DOB/SĐT/địa chỉ NCT + bảo trợ, mối quan hệ.
- Phần phụ lục (bảng phí, đánh giá, cam kết) **để trống điền tay & ký tay**.
- 7 fields được thêm vào `Resident` type nhưng **chưa persist xuống DB** — chỉ sống trong wizard state cho tới khi tải hợp đồng.

## Phase 2 work items

### 2.1 Migration Supabase cho contract fields *(bắt buộc, làm trước tiên)*

Thêm columns vào bảng `residents`:

```sql
ALTER TABLE residents
  ADD COLUMN id_card text,
  ADD COLUMN guardian_address text,
  ADD COLUMN guardian_id_card text,
  ADD COLUMN guardian_relation text,
  ADD COLUMN contract_number text,
  ADD COLUMN contract_signed_date date,
  ADD COLUMN contract_monthly_fee numeric(12,2);
```

Sau migration:
- Cập nhật `mapResidentToDb` / `mapResidentListItemFromDb` / `mapResidentToListItem` ở [src/services/residentService.ts](../src/services/residentService.ts).
- Cập nhật `RESIDENT_LIST_COLUMNS`.
- Cho phép re-print hợp đồng từ profile NCT (data đã có sẵn).

### 2.2 Auto-fill Phụ lục 1 (bảng phí)

**Hiện tại** (Phase 1): bảng phí trong template để nguyên 13 dòng giống mẫu, người dùng khoanh tròn dòng tương ứng.

**Phase 2**:
- Verify `CareLevelPrice` đã seed đủ 13 tổ hợp `(careLevel × roomType)`.
- Mở rộng template: bôi vàng dòng phù hợp + điền giá vào ô "Phí trọn gói" của riêng dòng đó.
- Thêm placeholder cho monthly fee + viết bằng chữ Việt: `{monthly_fee_label}` → "12.900.000 đồng (mười hai triệu chín trăm nghìn đồng)".
- Logic chọn dòng: đối chiếu `careLevel + roomType + selectedRoom.bedCount` với `CareLevelPrice` rows.

### 2.3 Tự động tạo transaction ký quỹ

Khi `addResident` hoàn tất:

```ts
await financeStore.addTransaction({
  date: contractSignedDate,
  residentName: resident.name,
  description: `Ký quỹ HĐ ${contractNumber}`,
  amount: 10_000_000,
  type: 'IN',
  performer: currentUser.name,
  status: 'Pending',  // Pending until cashier confirms receipt
});
```

- Cho phép admin override depositAmount trong wizard (mặc định 10tr).
- Toast confirm sau khi tạo: "Đã ghi nhận ký quỹ pending — vào Finance để xác nhận".

### 2.4 Auto-fill Phụ lục 2 (đánh giá mức độ chăm sóc)

Khi NCT đã có Assessment đầu tiên (qua [AssessmentWizard](../src/features/assessments/components/AssessmentWizard.tsx)):

- Re-print hợp đồng → các checkbox trong Phụ lục 2 đã tick sẵn theo Assessment.
- Yêu cầu: thêm placeholder dạng `{adl_bath}`, `{adl_dress}`, ... cho từng dòng đánh giá. Phải dùng docxtemplater conditional syntax `{#adl_bath_check_2}☒{/}{^adl_bath_check_2}☐{/}`.

### 2.5 Re-print từ profile NCT

Tab mới trong ResidentDetail: **Hợp đồng**:
- Nút "In lại hợp đồng" → gọi `buildContractDocx(ctx)` với data hiện tại.
- Hiển thị metadata: số HĐ, ngày ký, ký quỹ, lịch sử in (timestamp).
- Cảnh báo nếu data thay đổi (ví dụ chuyển phòng) → gợi ý làm phụ lục sửa đổi.

### 2.6 Bulk import NCT cũ *(chỉ làm nếu nhập tay quá lâu)*

Sau khi Phase 1 chạy thực tế 1-2 tuần, nếu thư ký vẫn còn nhiều NCT chưa nhập:
- Trang `/admissions/bulk-import`: upload Excel/CSV hoặc form table inline (mỗi dòng = 1 NCT).
- Validate per-row, hiển thị diff trước khi commit.
- KHÔNG sinh hợp đồng — coi như "đã ký từ trước".

### 2.7 Versioning hợp đồng (gia hạn / sửa đổi)

Sự kiện cần phụ lục bổ sung:
- Đổi cấp độ chăm sóc → đổi phí.
- Chuyển loại phòng (1G → 2G).
- Gia hạn sau hết hạn.

Schema:

```ts
interface ContractAddendum {
  id: string;
  residentId: string;
  contractNumber: string;        // số HĐ gốc
  addendumIndex: number;          // 1, 2, 3...
  effectiveDate: string;
  changeType: 'CARE_LEVEL' | 'ROOM' | 'FEE' | 'EXTEND' | 'OTHER';
  oldValue: string;
  newValue: string;
  signedAt?: string;
}
```

Render addendum bằng template thứ 2 (ngắn hơn, một trang).

### 2.8 In hàng loạt

Sau khi bulk import xong, có thể cần in lại hợp đồng cho từng NCT (legacy):
- Multi-select trên ResidentListPage.
- Generate ZIP chứa nhiều `.docx` (dùng `pizzip` cho output ZIP).
- Filename: `HD-{contractNumber}-{slug}.docx`.

### 2.9 E-signature *(nice-to-have, làm cuối)*

- Tích hợp dịch vụ ký số nội địa (VNPT eContract, FPT.eContract).
- Yêu cầu: parse signed PDF từ provider, attach vào resident profile.

## Thứ tự ưu tiên đề xuất

1. **2.1 Migration** — không có cái này thì 2.2-2.5 đều mắc kẹt.
2. **2.5 Re-print từ profile** — sau khi data đã persist, đây là tính năng trước tiên người dùng cần (in lại khi lệch).
3. **2.3 Transaction ký quỹ** — ngắn, đỡ thao tác kế toán.
4. **2.2 Auto-fill bảng phí** — phụ thuộc CareLevelPrice seed đủ.
5. **2.4 Auto-fill đánh giá** — chỉ value-add khi đã có nhiều Assessment.
6. **2.7 Versioning** — chỉ làm khi có nghiệp vụ thực tế (sau 1-2 tháng vận hành).
7. **2.6 Bulk import** + **2.8 In hàng loạt** — nếu cần.
8. **2.9 E-signature** — sau cùng.

## Rủi ro cần theo dõi

- **Schema lệch**: nếu Phase 1 đã chạy lâu mà NCT mới được tạo có data session-only (contract fields), sau migration phải có script sync lại từ template đã in. Khuyến nghị: làm 2.1 trong 1-2 tuần đầu.
- **Bed contention**: 2 thư ký xếp cùng giường → race condition. Hiện tại không có check server-side.
- **Văn bản pháp lý**: nếu pháp lý cập nhật hợp đồng mẫu, phải chạy lại `python scripts/build-contract-template.py` và verify placeholders không lệch position.
