import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, X, User as UserIcon, ArrowRight, LogOut, Settings, Cloud, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../data';
import { useAuthStore } from '../../stores/authStore';
import { useResidentsStore } from '../../stores/residentsStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useIncidentsStore } from '../../stores/incidentsStore';
import { Resident } from '../../types';

interface HeaderProps {
   title: string;
}

export const Header = ({ title }: HeaderProps) => {
   const navigate = useNavigate();
   const { user, logout } = useAuthStore();
   const { residents, isSyncing: residentsSync } = useResidentsStore();
   const { inventory, isSyncing: inventorySync } = useInventoryStore();
   const { incidents, isSyncing: incidentsSync } = useIncidentsStore();

   const isSyncing = residentsSync || inventorySync || incidentsSync;

   const [search, setSearch] = useState('');
   const [showNotifications, setShowNotifications] = useState(false);
   const [showSearch, setShowSearch] = useState(false);
   const [showUserMenu, setShowUserMenu] = useState(false);

   const searchRef = useRef<HTMLDivElement>(null);
   const notifRef = useRef<HTMLDivElement>(null);
   const userRef = useRef<HTMLDivElement>(null);

   // Dynamic Notifications Logic
   const notifications = useMemo(() => {
      const list = [];
      const today = new Date();

      // 1. Debt Alerts (> 5M VND)
      residents.forEach(r => {
         if (r.balance <= -5000000) {
            list.push({
               id: `debt-${r.id}`,
               type: 'finance',
               title: 'Cảnh báo công nợ',
               message: `${r.name} - P.${r.room} nợ ${formatCurrency(Math.abs(r.balance))}`,
               time: 'Hôm nay'
            });
         }
         // Birthday Check
         const dob = new Date(r.dob);
         if (dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth()) {
            list.push({
               id: `bday-${r.id}`,
               type: 'info',
               title: 'Sinh nhật NCT',
               message: `Hôm nay là sinh nhật của ${r.name} (${today.getFullYear() - dob.getFullYear()} tuổi)`,
               time: 'Hôm nay'
            });
         }
      });

      // 2. Low Stock Alerts
      inventory.forEach(item => {
         if (item.stock <= item.minStock) {
            list.push({
               id: `stock-${item.id}`,
               type: 'inventory',
               title: 'Sắp hết hàng',
               message: `${item.name} chỉ còn ${item.stock} ${item.unit} (Định mức: ${item.minStock})`,
               time: 'Ngay bây giờ'
            });
         }
      });

      // 3. New Incidents
      incidents.forEach(inc => {
         if (inc.status === 'New') {
            list.push({
               id: `inc-${inc.id}`,
               type: 'incident',
               title: 'Sự cố mới',
               message: `${inc.type} tại ${inc.location} - Mức độ: ${inc.severity}`,
               time: inc.time
            });
         }
      });

      return list;
   }, [residents, inventory, incidents]);

   const filteredResidents = search
      ? residents.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.room.includes(search))
      : [];

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearch(false);
         if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
         if (userRef.current && !userRef.current.contains(event.target as Node)) setShowUserMenu(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const handleNotificationClick = (n: any) => {
      toast(n.message, {
         icon: n.type === 'info' ? 'ℹ️' : '⚠️',
      });
      setShowNotifications(false);
   };

   const handleSelectResident = (r: Resident) => {
      useResidentsStore.getState().selectResident(r);
      navigate(`/residents/${r.id}`);
      setSearch('');
      setShowSearch(false);
   };

   if (!user) return null;

   return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 py-4 flex justify-between items-center shadow-sm h-[72px]">
         <div className="flex items-center gap-8 flex-1">
            <div className="flex flex-col">
               <h1 className="text-xl font-bold text-slate-800 whitespace-nowrap min-w-[200px]">
                  {title}
               </h1>
               <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                  {isSyncing ? (
                     <span className="text-teal-600 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đang đồng bộ Cloud...
                     </span>
                  ) : (
                     <span className="text-slate-400 flex items-center gap-1">
                        <Cloud className="w-2.5 h-2.5" /> Supabase Connected
                     </span>
                  )}
               </div>
            </div>

            {/* Global Search */}
            <div className="relative max-w-md w-full" ref={searchRef}>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                     type="text"
                     placeholder="Tìm nhanh NCT (Tên, Số phòng)..."
                     className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-teal-500 border rounded-lg text-sm transition-all outline-none"
                     value={search}
                     onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
                     onFocus={() => setShowSearch(true)}
                  />
                  {search && (
                     <button onClick={() => { setSearch(''); setShowSearch(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-3 h-3" />
                     </button>
                  )}
               </div>

               {/* Search Results Dropdown */}
               {showSearch && search && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-96 overflow-y-auto z-30 animate-in fade-in zoom-in-95 duration-200">
                     {filteredResidents.length > 0 ? (
                        <div className="py-2">
                           <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase">Kết quả tìm kiếm ({filteredResidents.length})</div>
                           {filteredResidents.map(r => (
                              <div
                                 key={r.id}
                                 onClick={() => handleSelectResident(r)}
                                 className="px-4 py-3 hover:bg-teal-50 cursor-pointer flex items-center gap-3 transition-colors group"
                              >
                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-teal-200 group-hover:text-teal-700">
                                    <UserIcon className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1">
                                    <p className="font-bold text-slate-800 text-sm group-hover:text-teal-800">{r.name}</p>
                                    <p className="text-xs text-slate-500">Phòng {r.room} • {r.floor}</p>
                                 </div>
                                 <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500" />
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="p-8 text-center text-slate-500 text-sm italic">
                           Không tìm thấy kết quả nào cho "{search}"
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
               <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-teal-50 text-teal-600' : 'text-slate-400 hover:text-teal-600 hover:bg-slate-50'}`}
               >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                     <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
               </button>

               {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-30 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                     <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{notifications.length}</span>
                     </div>
                     <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map((n, i) => (
                           <div
                              key={i}
                              onClick={() => handleNotificationClick(n)}
                              className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer transition-colors"
                           >
                              <div className="flex gap-3">
                                 <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'finance' ? 'bg-red-500' :
                                    n.type === 'inventory' ? 'bg-orange-500' :
                                       n.type === 'incident' ? 'bg-purple-500' : 'bg-blue-500'
                                    }`}></div>
                                 <div>
                                    <div className="flex justify-between items-start">
                                       <p className="text-sm font-bold text-slate-800">{n.title}</p>
                                       <span className="text-[10px] text-slate-400">{n.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                                 </div>
                              </div>
                           </div>
                        )) : (
                           <div className="p-8 text-center text-slate-400 text-sm italic">
                              Không có thông báo mới
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userRef}>
               <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 p-2 rounded-r-lg transition-colors"
               >
                  <div className="text-right hidden md:block">
                     <span className="block text-sm font-bold text-slate-700">{user.name}</span>
                     <span className="block text-xs text-slate-500">{user.role}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                     {user.name.charAt(0)}
                  </div>
               </button>

               {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-30 animate-in fade-in zoom-in-95 duration-200 overflow-hidden py-1">
                     <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                     </div>
                     <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" /> Hồ sơ cá nhân
                     </button>
                     <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Đổi mật khẩu
                     </button>
                     <div className="border-t border-slate-50 my-1"></div>
                     <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                     >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                     </button>
                  </div>
               )}
            </div>
         </div>
      </header>
   );
};