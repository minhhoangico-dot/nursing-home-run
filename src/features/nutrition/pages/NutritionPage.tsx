import React, { useState, useRef } from 'react';
import { Printer, ChefHat, AlertCircle, Search, Soup, Coffee, FileText } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useResidentsStore } from '../../../stores/residentsStore';

type DietType = 'Normal' | 'Porridge' | 'Soup' | 'Pureed' | 'Tube' | 'Cut';

const DIET_CONFIG: Record<DietType, { label: string; color: string; icon: any; order: number }> = {
   Normal: { label: 'Cơm (Thường)', color: 'bg-green-100 text-green-800', icon: ChefHat, order: 6 },
   Porridge: { label: 'Cháo', color: 'bg-yellow-100 text-yellow-800', icon: Coffee, order: 1 },
   Soup: { label: 'Súp', color: 'bg-orange-100 text-orange-800', icon: Soup, order: 2 },
   Pureed: { label: 'Xay', color: 'bg-purple-100 text-purple-800', icon: Soup, order: 3 },
   Tube: { label: 'Ăn qua Sonde', color: 'bg-red-100 text-red-800', icon: AlertCircle, order: 0 },
   Cut: { label: 'Cắt cơm', color: 'bg-slate-100 text-slate-800', icon: FileText, order: 5 },
};

export const NutritionPage = () => {
   const { user } = useAuthStore();
   const { residents } = useResidentsStore();
   const [searchTerm, setSearchTerm] = useState('');
   const printRef = useRef<HTMLDivElement>(null);

   if (!user) return null;

   const activeResidents = residents.filter(r => r.status === 'Active');

   const specialDietResidents = activeResidents.filter(r => {
      const isSpecialDiet = r.dietType !== 'Normal';
      const hasAllergy = r.allergies && r.allergies.length > 0;
      const hasNote = r.dietNote && r.dietNote.trim().length > 0;

      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.room.toLowerCase().includes(searchTerm.toLowerCase());

      return (isSpecialDiet || hasAllergy || hasNote) && matchesSearch;
   }).sort((a, b) => {
      const orderA = DIET_CONFIG[a.dietType as DietType]?.order ?? 99;
      const orderB = DIET_CONFIG[b.dietType as DietType]?.order ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.room.localeCompare(b.room);
   });

   const stats = activeResidents.reduce((acc, r) => {
      const type = r.dietType as DietType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
   }, {} as Record<string, number>);

   const handlePrint = () => {
      window.print();
   };

   return (
      <div className="space-y-6 h-full flex flex-col">
         {/* Header - Hidden on Print */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
            <div>
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-teal-600" />
                  Quản lý Dinh dưỡng & Suất ăn
               </h2>
               <p className="text-slate-500 text-sm">Danh sách cư dân có chế độ ăn đặc biệt</p>
            </div>
            <div className="flex gap-3">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                     type="text"
                     placeholder="Tìm kiếm..."
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                     className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-teal-500 focus:border-teal-500 w-64"
                  />
               </div>
               <button
                  onClick={handlePrint}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2 transition-colors"
               >
                  <Printer className="w-4 h-4" />
                  In Danh sách Bếp
               </button>
            </div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5 print:gap-2">
            {(['Tube', 'Porridge', 'Soup', 'Pureed', 'Cut'] as DietType[]).map(type => (
               <div key={type} className={`p-4 rounded-xl border ${DIET_CONFIG[type].color} bg-opacity-50 border-white/50 shadow-sm print:border-slate-300 print:shadow-none`}>
                  <div className="flex items-center justify-between mb-1">
                     <div className="p-2 bg-white rounded-lg bg-opacity-60">
                        {React.createElement(DIET_CONFIG[type].icon, { className: 'w-5 h-5' })}
                     </div>
                     <span className="text-2xl font-bold">{stats[type] || 0}</span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                     {DIET_CONFIG[type].label}
                  </div>
               </div>
            ))}
         </div>

         {/* Main Content Area */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col print:shadow-none print:border-none print:h-auto">
            {/* Print Header */}
            <div className="hidden print:block p-8 pb-0 text-center">
               <h1 className="text-2xl font-bold uppercase text-slate-900 mb-2">Danh sách Chế độ ăn Đặc biệt</h1>
               <p className="text-slate-500">Ngày: {new Date().toLocaleDateString('vi-VN')} | Giờ in: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
               <div className="mt-4 border-b border-slate-300 w-full"></div>
            </div>

            <div className="overflow-auto flex-1 p-0 print:overflow-visible">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 print:static">
                     <tr>
                        <th className="py-3 px-4 md:px-6 font-semibold text-slate-600 border-b border-slate-200">Phòng</th>
                        <th className="py-3 px-4 md:px-6 font-semibold text-slate-600 border-b border-slate-200">Cư dân</th>
                        <th className="py-3 px-4 md:px-6 font-semibold text-slate-600 border-b border-slate-200">Chế độ ăn</th>
                        <th className="py-3 px-4 md:px-6 font-semibold text-slate-600 border-b border-slate-200">Ghi chú / Dị ứng</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                     {specialDietResidents.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                              Không có cư dân nào có chế độ ăn đặc biệt.
                           </td>
                        </tr>
                     ) : (
                        specialDietResidents.map((r, idx) => {
                           const dietConfig = DIET_CONFIG[r.dietType as DietType] || DIET_CONFIG.Normal;
                           return (
                              <tr key={r.id} className="hover:bg-slate-50 print:hover:bg-transparent break-inside-avoid">
                                 <td className="py-3 px-4 md:px-6 text-slate-800 font-medium align-top w-24">
                                    {r.room}
                                 </td>
                                 <td className="py-3 px-4 md:px-6 text-slate-800 font-bold align-top w-48">
                                    {r.name}
                                    <div className="text-xs text-slate-400 font-normal print:hidden">
                                       {new Date().getFullYear() - new Date(r.dob).getFullYear()} tuổi
                                    </div>
                                 </td>
                                 <td className="py-3 px-4 md:px-6 align-top w-40">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${dietConfig.color} print:bg-transparent print:text-black print:border print:border-slate-300 print:px-0 print:py-0`}>
                                       {/* Icon only on screen */}
                                       <dietConfig.icon className="w-3.5 h-3.5 print:hidden" />
                                       {dietConfig.label.toUpperCase()}
                                    </span>
                                 </td>
                                 <td className="py-3 px-4 md:px-6 align-top">
                                    <div className="space-y-1">
                                       {r.dietType === 'Tube' && (
                                          <div className="text-sm text-red-700 font-medium">⚠️ Ăn qua Sonde</div>
                                       )}
                                       {r.dietNote && (
                                          <div className="text-sm text-slate-700">
                                             <span className="font-semibold text-slate-500 text-xs uppercase mr-1">Lưu ý:</span>
                                             {r.dietNote}
                                          </div>
                                       )}
                                       {r.allergies && r.allergies.length > 0 && (
                                          <div className="text-sm text-red-600 font-medium bg-red-50 p-1.5 rounded inline-block print:bg-transparent print:p-0 print:text-black">
                                             <span className="font-bold text-red-700 text-xs uppercase mr-1 print:text-black">☠️ Dị ứng:</span>
                                             {r.allergies.map(a => a.allergen).join(', ')}
                                          </div>
                                       )}
                                       {!r.dietNote && (!r.allergies || r.allergies.length === 0) && r.dietType !== 'Normal' && (
                                          <span className="text-slate-400 text-sm italic">-</span>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>

            {/* Print Footer */}
            <div className="hidden print:flex justify-between mt-8 pt-8 px-8 text-sm text-slate-600">
               <div className="text-center">
                  <p className="font-bold mb-16">Người lập phiếu</p>
                  <p>{user.name}</p>
               </div>
               <div className="text-center">
                  <p className="font-bold mb-16">Bếp trưởng</p>
                  <p>(Ký nhận)</p>
               </div>
            </div>
         </div>
      </div>
   );
};