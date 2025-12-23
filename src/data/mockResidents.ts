import { Resident } from '../types/index';

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'R001',
    name: 'Nguyễn Văn Minh',
    dob: '1945-05-15',
    gender: 'Nam',
    room: '101',
    bed: 'A',
    floor: 'Tầng 1',
    building: 'Tòa A',
    careLevel: 1,
    status: 'Active',
    admissionDate: '2023-01-10',
    guardianName: 'Nguyễn Minh Tuấn',
    guardianPhone: '0903123456',
    balance: -8500000,
    assessments: [
      { date: '2023-10-01', score: 8, level: 1, assessor: 'BS. Lê Minh Khánh' }
    ],
    prescriptions: [
      { id: 'P101', medicationName: 'Amlodipine 5mg', dosage: '1 viên', frequency: 'Sáng', startDate: '2023-01-10', endDate: '2024-01-10', doctor: 'BS. Lê Minh Khánh', status: 'Active' }
    ],
    medicalVisits: [
      { id: 'V1', date: '2023-10-15', doctor: 'BS. Lê Minh Khánh', complaint: 'Đau nhẹ vùng khớp gối', diagnosis: 'Thoái hóa khớp tuổi già', treatment: 'Chườm ấm, vận động nhẹ' }
    ],
    specialMonitoring: [],
    medicalHistory: [
      { id: 'H1', name: 'Cao huyết áp', diagnosedDate: '2015', status: 'Active' },
      { id: 'H2', name: 'Thoái hóa khớp', diagnosedDate: '2020', status: 'Active' }
    ],
    allergies: [
      { id: 'A1', allergen: 'Penicillin', severity: 'Nặng', reaction: 'Nổi mề đay, khó thở' }
    ],
    vitalSigns: [
      { id: 'VS1', dateTime: '2023-10-25 08:00', bp: '125/80', pulse: 72, temp: 36.6, spo2: 98, recorder: 'ĐD. Lan' }
    ],
    careLogs: [
      { id: 'CL1', timestamp: '2023-10-25T07:30:00Z', category: 'Nutrition', note: 'Ăn hết suất sáng, tinh thần vui vẻ', performer: 'HL. Tú' }
    ],
    currentConditionNote: 'Sức khỏe ổn định, tự sinh hoạt tốt.',
    lastMedicalUpdate: '2023-10-15',
    roomType: '1 Giường',
    dietType: 'Normal'
  },
  {
    id: 'R002',
    name: 'Lê Thị Lan',
    dob: '1950-11-20',
    gender: 'Nữ',
    room: '202',
    bed: 'B',
    floor: 'Tầng 2',
    building: 'Tòa A',
    careLevel: 2,
    status: 'Active',
    admissionDate: '2023-03-15',
    guardianName: 'Trần Thị Mỹ',
    guardianPhone: '0988776655',
    balance: 0,
    assessments: [
      { date: '2023-09-20', score: 18, level: 2, assessor: 'BS. Lê Minh Khánh' }
    ],
    prescriptions: [
      { id: 'P201', medicationName: 'Metformin 500mg', dosage: '1 viên', frequency: 'Sáng, Chiều', startDate: '2023-03-15', endDate: '2023-12-15', doctor: 'BS. Lê Minh Khánh', status: 'Active' }
    ],
    medicalVisits: [],
    specialMonitoring: [
      { id: 'M1', type: 'Theo dõi đường huyết', frequency: 'Sáng trước ăn', startDate: '2023-10-01', note: 'Báo bác sĩ nếu > 10.0 mmol/L', status: 'Active', assigner: 'BS. Khánh' }
    ],
    medicalHistory: [
      { id: 'H3', name: 'Tiểu đường Type 2', diagnosedDate: '2018', status: 'Active' }
    ],
    allergies: [],
    careLogs: [],
    currentConditionNote: 'Cần hỗ trợ nhắc uống thuốc và theo dõi ăn uống đồ ngọt.',
    lastMedicalUpdate: '2023-09-20',
    roomType: '2 Giường',
    dietType: 'Porridge',
    dietNote: 'Hạn chế tinh bột và đường'
  },
  {
    id: 'R003',
    name: 'Trần Thế Hiển',
    dob: '1938-02-10',
    gender: 'Nam',
    room: '305',
    bed: 'A',
    floor: 'Tầng 3',
    building: 'Tòa A',
    careLevel: 4,
    status: 'Active',
    admissionDate: '2022-11-05',
    guardianName: 'Trần Thế Anh',
    guardianPhone: '0912999888',
    balance: -12500000,
    assessments: [
      { date: '2023-10-05', score: 35, level: 4, assessor: 'BS. Lê Minh Khánh' }
    ],
    prescriptions: [
      { id: 'P301', medicationName: 'Donepezil 5mg', dosage: '1 viên', frequency: 'Tối', startDate: '2022-11-05', endDate: '2024-11-05', doctor: 'BS. Lê Minh Khánh', status: 'Active' }
    ],
    medicalVisits: [
      { id: 'V2', date: '2023-10-10', doctor: 'BS. Lê Minh Khánh', complaint: 'Mất định hướng, kích động nhẹ ban đêm', diagnosis: 'Alzheimer giai đoạn tiến triển', treatment: 'Tăng cường giám sát, sử dụng thuốc hỗ trợ thần kinh' }
    ],
    specialMonitoring: [
      { id: 'M2', type: 'Chăm sóc toàn diện', frequency: '24/7', startDate: '2023-10-05', note: 'Hỗ trợ vệ sinh, ăn uống tại giường', status: 'Active', assigner: 'BS. Khánh' }
    ],
    medicalHistory: [
      { id: 'H4', name: 'Sa sút trí tuệ (Alzheimer)', diagnosedDate: '2019', status: 'Active' },
      { id: 'H5', name: 'Di chứng Tai biến mạch máu não', diagnosedDate: '2021', status: 'Active' }
    ],
    allergies: [
      { id: 'A2', allergen: 'Hải sản', severity: 'Trung bình', reaction: 'Ngứa, đỏ da' }
    ],
    careLogs: [
      { id: 'CL2', timestamp: '2023-10-25T08:00:00Z', category: 'Hygiene', note: 'Đã thay bỉm và lau người tại giường', performer: 'HL. Mai' }
    ],
    currentConditionNote: 'Liệt nửa người trái, mất nhận thức không gian thời gian. Cần chăm sóc cấp độ cao nhất.',
    lastMedicalUpdate: '2023-10-10',
    roomType: '4 Giường',
    dietType: 'Pureed',
    dietNote: 'Thức ăn xay nhuyễn, tránh sặc'
  }
];