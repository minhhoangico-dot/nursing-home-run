import React, { useState } from 'react';
import { Plus, ArrowRightLeft, Search, History, ShoppingCart, Package } from 'lucide-react';
import { InventoryItem, InventoryTransaction, PurchaseRequest } from '../../../types/index';
import { formatCurrency } from '../../../data/index';
import { InventoryTransactionModal } from '../components/InventoryTransactionModal';
import { AddStockItemModal } from '../components/AddStockItemModal';
import { StockHistory } from '../components/StockHistory';
import { PurchaseRequestList } from '../components/PurchaseRequestList';
import { Button } from '../../../components/ui';
import { useToast } from '../../../app/providers';
import { useInventoryStore } from '../../../stores/inventoryStore';
import { useAuthStore } from '../../../stores/authStore';

export const StockPage = () => {
   const { user } = useAuthStore();
   const { inventory, transactions, purchaseRequests: requests, addTransaction, addInventoryItem, addPurchaseRequest } = useInventoryStore();
   const [activeTab, setActiveTab] = useState<'stock' | 'history' | 'requests'>('stock');
   const [showTransactionModal, setShowTransactionModal] = useState(false);
   const [showAddModal, setShowAddModal] = useState(false);
   const { addToast } = useToast();

   const [search, setSearch] = useState('');
   const [categoryFilter, setCategoryFilter] = useState('Tất cả');

   if (!user) return null;

   const handleTransaction = async (trx: InventoryTransaction) => {
      try {
         await addTransaction(trx);
         setShowTransactionModal(false);
         addToast('success', 'Thành công', 'Giao dịch kho đã được ghi nhận.');
      } catch (error) {
         addToast('error', 'Lỗi', 'Giao dịch thất bại');
      }
   };

   const handleAddItem = async (item: InventoryItem) => {
      try {
         await addInventoryItem(item);
         setShowAddModal(false);
         addToast('success', 'Đã thêm vật tư', `Vật tư ${item.name} đã được thêm vào kho.`);
      } catch (error) {
         addToast('error', 'Lỗi', 'Thêm vật tư thất bại');
      }
   };

   const handleAddRequest = async (req: PurchaseRequest) => {
      try {
         await addPurchaseRequest(req);
         addToast('success', 'Đã tạo yêu cầu', 'Yêu cầu mua sắm đã được tạo thành công.');
      } catch (error) {
         addToast('error', 'Lỗi', 'Tạo yêu cầu thất bại');
      }
   };

   // Filter Logic
   const filteredInventory = inventory.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'Tất cả' || item.category === categoryFilter;
      return matchSearch && matchCategory;
   });

   const tabs = [
      { id: 'stock', label: 'Tồn kho hiện tại', icon: Package },
      { id: 'history', label: 'Lịch sử nhập/xuất', icon: History },
      { id: 'requests', label: 'Đề xuất mua sắm', icon: ShoppingCart },
   ];

   return (
      <div className="space-y-6">
         {showTransactionModal && (
            <InventoryTransactionModal
               user={user}
               inventory={inventory}
               onClose={() => setShowTransactionModal(false)}
               onConfirm={handleTransaction}
            />
         )}

         {showAddModal && (
            <AddStockItemModal
               onClose={() => setShowAddModal(false)}
               onSave={handleAddItem}
            />
         )}

         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Kho & Vật tư</h2>
            <div className="flex gap-3">
               <Button onClick={() => setShowAddModal(true)} variant="secondary" icon={<Plus className="w-4 h-4" />}>
                  Thêm vật tư
               </Button>
               <Button onClick={() => setShowTransactionModal(true)} icon={<ArrowRightLeft className="w-4 h-4" />}>
                  Nhập / Xuất kho
               </Button>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex border-b border-slate-200">
            {tabs.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                     }`}
               >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
               </button>
            ))}
         </div>

         {activeTab === 'stock' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               {/* Filters */}
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-fit">
                  <div className="mb-4">
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tìm kiếm</label>
                     <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                           type="text"
                           placeholder="Tên, mã vật tư..."
                           className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                           value={search}
                           onChange={e => setSearch(e.target.value)}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Danh mục</label>
                     <div className="space-y-1">
                        {['Tất cả', 'Thuốc', 'Vật tư y tế', 'Sinh hoạt', 'Thực phẩm'].map((cat, i) => (
                           <div
                              key={i}
                              onClick={() => setCategoryFilter(cat)}
                              className={`p-2 rounded cursor-pointer text-sm flex justify-between items-center transition-colors ${categoryFilter === cat ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                 }`}
                           >
                              {cat}
                              {categoryFilter === cat && <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Inventory Table */}
               <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 text-sm text-slate-500 flex justify-between">
                     <span>Hiển thị {filteredInventory.length} kết quả</span>
                  </div>
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                           <th className="px-6 py-3">Mã</th>
                           <th className="px-6 py-3">Tên vật tư</th>
                           <th className="px-6 py-3">Đơn vị</th>
                           <th className="px-6 py-3 text-right">Tồn kho</th>
                           <th className="px-6 py-3 text-right">Giá vốn</th>
                           <th className="px-6 py-3 text-center">Trạng thái</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filteredInventory.map(item => (
                           <tr key={item.id} className="hover:bg-slate-50 group">
                              <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.id}</td>
                              <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                              <td className="px-6 py-4 text-slate-600">{item.unit}</td>
                              <td className="px-6 py-4 text-right font-bold text-slate-800">{item.stock}</td>
                              <td className="px-6 py-4 text-right text-slate-500">{formatCurrency(item.price)}</td>
                              <td className="px-6 py-4 text-center">
                                 {item.stock <= item.minStock ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-100 text-red-700 font-medium">
                                       Cần nhập
                                    </span>
                                 ) : (
                                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Ổn định</span>
                                 )}
                              </td>
                           </tr>
                        ))}
                        {filteredInventory.length === 0 && (
                           <tr><td colSpan={6} className="text-center py-12 text-slate-400 italic">Không tìm thấy vật tư nào</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'history' && <StockHistory transactions={transactions} />}

         {activeTab === 'requests' && (
            <PurchaseRequestList
               requests={requests}
               inventory={inventory}
               onRequest={handleAddRequest}
            />
         )}
      </div>
   );
};