import { InventoryItem } from '../types/index';

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Thuốc
  { id: 'MED-001', name: 'Amlodipine 5mg', category: 'Thuốc', unit: 'Viên', stock: 500, minStock: 100, price: 2500 },
  { id: 'MED-002', name: 'Metformin 500mg', category: 'Thuốc', unit: 'Viên', stock: 300, minStock: 50, price: 3000 },
  { id: 'MED-003', name: 'Paracetamol 500mg', category: 'Thuốc', unit: 'Viên', stock: 1000, minStock: 200, price: 1000 },
  { id: 'MED-004', name: 'Donepezil 5mg', category: 'Thuốc', unit: 'Viên', stock: 45, minStock: 50, price: 15000 },
  { id: 'MED-005', name: 'Insulin Lantus SoloStar', category: 'Thuốc', unit: 'Bút', stock: 12, minStock: 5, price: 320000 },
  
  // Vật tư y tế
  { id: 'SUP-001', name: 'Găng tay y tế (Hộp 100)', category: 'Y tế', unit: 'Hộp', stock: 25, minStock: 10, price: 85000 },
  { id: 'SUP-002', name: 'Bông gòn y tế 500g', category: 'Y tế', unit: 'Gói', stock: 15, minStock: 5, price: 45000 },
  { id: 'SUP-003', name: 'Gạc tiệt trùng 10x10', category: 'Y tế', unit: 'Gói', stock: 100, minStock: 30, price: 5000 },
  { id: 'SUP-004', name: 'Que thử đường huyết Accu-Chek', category: 'Y tế', unit: 'Hộp', stock: 8, minStock: 10, price: 350000 },
  
  // Sinh hoạt
  { id: 'GEN-001', name: 'Bỉm người lớn Caryn (L)', category: 'Sinh hoạt', unit: 'Gói', stock: 40, minStock: 20, price: 165000 },
  { id: 'GEN-002', name: 'Khăn giấy ướt', category: 'Sinh hoạt', unit: 'Gói', stock: 60, minStock: 15, price: 22000 },
  { id: 'GEN-003', name: 'Sữa Ensure Gold 850g', category: 'Sinh hoạt', unit: 'Lon', stock: 24, minStock: 6, price: 780000 },
  
  // Thực phẩm
  { id: 'FOOD-001', name: 'Gạo thơm lài', category: 'Thực phẩm', unit: 'kg', stock: 150, minStock: 50, price: 18000 },
  { id: 'FOOD-002', name: 'Dầu ăn Tường An 5L', category: 'Thực phẩm', unit: 'Bình', stock: 10, minStock: 4, price: 215000 },
  { id: 'FOOD-003', name: 'Thịt heo nạc', category: 'Thực phẩm', unit: 'kg', stock: 5, minStock: 10, price: 140000 }
];