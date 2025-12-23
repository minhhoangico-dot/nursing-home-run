import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { ServicePrice } from '../../../types/index';
import { formatCurrency } from '../../../utils/formatters';
import { useToast } from '../../../app/providers';

interface PricingConfigProps {
   prices: ServicePrice[];
   onUpdatePrices: (prices: ServicePrice[]) => void;
}

export const PricingConfig = ({ prices, onUpdatePrices }: PricingConfigProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServicePrice>>({});
  const { addToast } = useToast();

  const handleEdit = (item: ServicePrice) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = () => {
    onUpdatePrices(prices.map(p => p.id === editingId ? { ...p, ...editForm } as ServicePrice : p));
    setEditingId(null);
    addToast('success', 'Đã cập nhật', 'Giá dịch vụ đã được lưu thành công.');
  };

  const categories = {
    ROOM: 'Phòng ở',
    CARE: 'Chăm sóc',
    MEAL: 'Ăn uống',
    OTHER: 'Khác'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Cấu hình Bảng giá Dịch vụ</h3>
        <button className="bg-teal-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-teal-700 shadow-sm">
          <Plus className="w-4 h-4" /> Thêm dịch vụ
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Tên dịch vụ</th>
              <th className="px-6 py-3">Danh mục</th>
              <th className="px-6 py-3">Đơn vị</th>
              <th className="px-6 py-3 text-right">Đơn giá</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prices.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {editingId === item.id ? (
                    <input 
                      className="border rounded px-2 py-1 w-full"
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                  ) : item.name}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    item.category === 'ROOM' ? 'bg-blue-100 text-blue-700' :
                    item.category === 'CARE' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {categories[item.category]}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{item.unit}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">
                  {editingId === item.id ? (
                    <input 
                      type="number"
                      className="border rounded px-2 py-1 w-32 text-right"
                      value={editForm.price}
                      onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                    />
                  ) : formatCurrency(item.price)}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === item.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-teal-600"><Edit2 className="w-4 h-4" /></button>
                      <button className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};