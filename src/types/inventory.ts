export interface InventoryItem {
  id: string;
  name: string;
  category: 'Thuốc' | 'Y tế' | 'Sinh hoạt' | 'Thực phẩm';
  unit: string;
  stock: number;
  minStock: number;
  price: number;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  performer: string;
  reason?: string;
}

export interface PurchaseRequest {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  status: 'Pending' | 'Approved' | 'Ordered' | 'Received';
  requestDate: string;
  priority: 'Normal' | 'High';
  estimatedCost: number;
}