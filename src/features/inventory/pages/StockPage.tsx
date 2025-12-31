import React, { useState } from 'react';
import { Plus, ArrowRightLeft, Search, History, ShoppingCart, Package, Filter, X } from 'lucide-react';
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
   const [showMobileFilter, setShowMobileFilter] = useState(false);

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

         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Kho & Vật tư</h2>
            <div className="flex gap-2 w-full sm:w-auto">
               <Button onClick={() => setShowAddModal(true)} variant="secondary" icon={<Plus className="w-4 h-4" />} className="flex-1 sm:flex-none text-sm">
                  <span className="hidden sm:inline">Thêm vật tư</span>
                  <span className="sm:hidden">Thêm</span>
               </Button>
               <Button onClick={() => setShowTransactionModal(true)} icon={<ArrowRightLeft className="w-4 h-4" />} className="flex-1 sm:flex-none text-sm">
                  <span className="hidden sm:inline">Nhập / Xuất kho</span>
                  <span className="sm:hidden">Nhập/Xuất</span>
               </Button>
            </div>
         </div>

         {/* Navigation Tabs - horizontal scroll on mobile */}
         <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                     }`}
               >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'stock' ? 'Tồn kho' : tab.id === 'history' ? 'Lịch sử' : 'Đề xuất'}</span>
               </button>
            ))}
         </div>

         {activeTab === 'stock' && (
            <>
               {/* Mobile Filter Button */}
               <div className="lg:hidden flex gap-2 mb-4">
                  <div className="relative flex-1">
                     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input
                        type="text"
                        placeholder="Tìm vật tư..."
                        className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                     />
                  </div>
                  <button
                     onClick={() => setShowMobileFilter(true)}
                     className="px-3 py-2 bg-slate-100 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-600"
                  >
                     <Filter className="w-4 h-4" />
                     {categoryFilter !== 'Tất cả' && <span className="w-2 h-2 bg-teal-500 rounded-full"></span>}
                  </button>
               </div>

               {/* Mobile Filter Bottom Sheet */}
               {showMobileFilter && (
                  <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMobileFilter(false)}>
                     <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold text-slate-800">Lọc danh mục</h3>
                           <button onClick={() => setShowMobileFilter(false)} className="p-2 hover:bg-slate-100 rounded-full">
                              <X className="w-5 h-5" />
                           </button>
                        </div>
                        <div className="space-y-2">
                           {['Tất cả', 'Thuốc', 'Vật tư y tế', 'Sinh hoạt', 'Thực phẩm'].map((cat, i) => (
                              <button
                                 key={i}
                                 onClick={() => { setCategoryFilter(cat); setShowMobileFilter(false); }}
                                 className={`w-full p-3 rounded-lg text-left text-sm flex justify-between items-center transition-colors ${categoryFilter === cat ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                 {cat}
                                 {categoryFilter === cat && <div className="w-2 h-2 rounded-full bg-teal-500"></div>}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Desktop Filters - hidden on mobile */}
                  <div className="hidden lg:block bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-fit">
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
                                 className={`p-2 rounded cursor-pointer text-sm flex justify-between items-center transition-colors ${categoryFilter === cat ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                 {cat}
                                 {categoryFilter === cat && <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Inventory - Table on desktop, Cards on mobile */}
                  <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                     <div className="p-4 border-b border-slate-100 text-sm text-slate-500 flex justify-between">
                        <span>Hiển thị {filteredInventory.length} kết quả</span>
                     </div>

                     {/* Desktop Table */}
                     <table className="hidden md:table w-full text-left text-sm">
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
                                       <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-100 text-red-700 font-medium">Cần nhập</span>
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

                     {/* Mobile Card View */}
                     <div className="md:hidden divide-y divide-slate-100">
                        {filteredInventory.map(item => (
                           <div key={item.id} className="p-4 hover:bg-slate-50 active:bg-slate-100">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <p className="font-bold text-slate-800">{item.name}</p>
                                    <p className="text-xs text-slate-400 font-mono">{item.id}</p>
                                 </div>
                                 {item.stock <= item.minStock ? (
                                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 font-medium">Cần nhập</span>
                                 ) : (
                                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Ổn định</span>
                                 )}
                              </div>
                              <div className="flex justify-between text-sm">
                                 <span className="text-slate-500">Tồn: <span className="font-bold text-slate-800">{item.stock}</span> {item.unit}</span>
                                 <span className="text-slate-500">Giá: {formatCurrency(item.price)}</span>
                              </div>
                           </div>
                        ))}
                        {filteredInventory.length === 0 && (
                           <div className="text-center py-12 text-slate-400 italic">Không tìm thấy vật tư nào</div>
                        )}
                     </div>
                  </div>
               </div>
            </>
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