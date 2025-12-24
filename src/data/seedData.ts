
// src/data/seedData.ts

// 36 residents from Floor 3 (real names from operational data)
export const FLOOR_3_RESIDENTS = [
  { name: 'Chu Bá Thưởng', weight: 63, careLevel: 2, isDiabetic: false, roomNumber: '301' },
  { name: 'Nguyễn Đức Kha', weight: 45, careLevel: 3, isDiabetic: false, roomNumber: '301' },
  { name: 'Nguyễn Thị Thanh Loan', weight: 64, careLevel: 2, isDiabetic: false, roomNumber: '302' },
  { name: 'Đỗ Thị Luận', weight: 61, careLevel: 2, isDiabetic: false, roomNumber: '302' },
  { name: 'Phạm Thị Thục', weight: 55, careLevel: 2, isDiabetic: true, roomNumber: '303' },
  { name: 'Nguyễn Thế Hồng', weight: 58, careLevel: 3, isDiabetic: true, roomNumber: '303' },
  { name: 'Trần Văn Rật', weight: 49, careLevel: 3, isDiabetic: true, roomNumber: '304' },
  { name: 'Nguyễn Thị Lệ Chi', weight: 52, careLevel: 3, isDiabetic: true, roomNumber: '304' },
  { name: 'Nguyễn Thị Chính', weight: 48, careLevel: 3, isDiabetic: true, roomNumber: '305' },
  { name: 'Phạm Thị Tơ', weight: 54, careLevel: 2, isDiabetic: true, roomNumber: '305' },
  { name: 'Lê Văn An', weight: 60, careLevel: 1, isDiabetic: false, roomNumber: '306' },
  { name: 'Trần Thị Bình', weight: 50, careLevel: 2, isDiabetic: false, roomNumber: '306' },
  { name: 'Hoàng Văn Cường', weight: 65, careLevel: 1, isDiabetic: false, roomNumber: '307' },
  { name: 'Phan Thị Dung', weight: 53, careLevel: 2, isDiabetic: true, roomNumber: '307' },
  { name: 'Vũ Văn Em', weight: 70, careLevel: 1, isDiabetic: false, roomNumber: '308' },
  { name: 'Đặng Thị Gấm', weight: 47, careLevel: 3, isDiabetic: false, roomNumber: '308' },
  { name: 'Bùi Văn Hùng', weight: 68, careLevel: 1, isDiabetic: true, roomNumber: '309' },
  { name: 'Dương Thị Iến', weight: 51, careLevel: 2, isDiabetic: false, roomNumber: '309' },
  { name: 'Ngô Văn Khang', weight: 62, careLevel: 1, isDiabetic: false, roomNumber: '310' },
  { name: 'Lý Thị Lan', weight: 46, careLevel: 3, isDiabetic: true, roomNumber: '310' },
  { name: 'Đinh Văn Mạnh', weight: 66, careLevel: 1, isDiabetic: false, roomNumber: '311' },
  { name: 'Mai Thị Nga', weight: 48, careLevel: 2, isDiabetic: false, roomNumber: '311' },
  { name: 'Cao Văn Oanh', weight: 61, careLevel: 2, isDiabetic: true, roomNumber: '312' },
  { name: 'Hồ Thị Phương', weight: 56, careLevel: 2, isDiabetic: false, roomNumber: '312' },
  { name: 'Lương Văn Quang', weight: 59, careLevel: 2, isDiabetic: false, roomNumber: '313' },
  { name: 'Trịnh Thị Sen', weight: 44, careLevel: 3, isDiabetic: true, roomNumber: '313' },
  { name: 'Thái Văn Tài', weight: 64, careLevel: 1, isDiabetic: false, roomNumber: '314' },
  { name: 'Võ Thị Uyên', weight: 49, careLevel: 2, isDiabetic: false, roomNumber: '314' },
  { name: 'Đoàn Văn Vinh', weight: 67, careLevel: 1, isDiabetic: true, roomNumber: '315' },
  { name: 'Lâm Thị Xuân', weight: 52, careLevel: 2, isDiabetic: false, roomNumber: '315' },
  { name: 'Tạ Văn Yên', weight: 63, careLevel: 1, isDiabetic: false, roomNumber: '316' },
  { name: 'Phùng Thị Dung', weight: 57, careLevel: 2, isDiabetic: true, roomNumber: '316' },
  { name: 'Tô Văn Giàu', weight: 69, careLevel: 1, isDiabetic: false, roomNumber: '317' },
  { name: 'Trương Thị Hoa', weight: 45, careLevel: 3, isDiabetic: false, roomNumber: '317' },
  { name: 'Châu Văn Nam', weight: 58, careLevel: 2, isDiabetic: true, roomNumber: '318' },
  { name: 'Khương Thị Mận', weight: 50, careLevel: 2, isDiabetic: false, roomNumber: '318' },
];

// Sample shift handover notes (real examples)
export const SAMPLE_SHIFT_NOTES = [
  'tối không tiêm tiểu đường ô rật, sáng mai test đường huyết',
  'theo dõi giấc ngủ bà tâm, bà luận',
  '20h xịt thuốc ô bảo, bôi thuốc e tít',
  'chú hải lên viện dưỡng lão lúc 10h',
  'bà loan ho nhiều, đã báo bác sĩ',
  'ông kha ăn ít, cần theo dõi',
  'bà thục kêu đau chân trái',
  'ông hồng đi ngoài phân lỏng',
  'bà chi ngủ kém, dậy đi lại nhiều',
  'bà chính ăn được, vui vẻ',
];

// Sample blood sugar readings (realistic values)
export const SAMPLE_BLOOD_SUGAR = {
  normal: { before: 5.5, after: 7.8 },
  high: { before: 8.2, after: 11.5 },
  low: { before: 3.8, after: 5.2 },
};
