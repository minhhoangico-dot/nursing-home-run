import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Users, Filter, X, Plus, Trash2 } from 'lucide-react';
import { StaffSchedule, SHIFT_CONFIG, ShiftAssignment } from '../../../types/schedule';
import { ShiftCell } from '../components/ShiftCell';
import { useToast } from '../../../app/providers';
import { ScheduleSidebar } from '../components/ScheduleSidebar';
import { ScheduleHeader } from '../components/ScheduleHeader';
import { useScheduleStore } from '../../../stores/scheduleStore';

const ROLES = {
   DOCTOR: { label: 'Bác sĩ', color: 'bg-blue-500' },
   NURSE: { label: 'Điều dưỡng', color: 'bg-teal-500' },
   CAREGIVER: { label: 'Hộ lý', color: 'bg-orange-500' },
   SUPERVISOR: { label: 'Trưởng tầng', color: 'bg-purple-500' },
   SECURITY: { label: 'Bảo vệ', color: 'bg-slate-600' },
   CLEANER: { label: 'Tạp vụ', color: 'bg-gray-500' },
   CHEF: { label: 'Bếp', color: 'bg-red-500' }
};

export const SchedulePage = () => {
   const { schedules, updateSchedule, addStaff, removeStaff } = useScheduleStore();
   const [currentWeekStart, setCurrentWeekStart] = useState(() => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + 1); // Monday
      return d;
   });
   const [roleFilter, setRoleFilter] = useState('ALL');
   const [buildingFilter, setBuildingFilter] = useState('');
   const [floorFilter, setFloorFilter] = useState('');
   const [isEditing, setIsEditing] = useState(false);
   const [showManageStaff, setShowManageStaff] = useState(false);

   // New Staff Form State
   const [newStaffName, setNewStaffName] = useState('');
   const [newStaffRole, setNewStaffRole] = useState('NURSE');

   const { addToast } = useToast();

   const weekDates = useMemo(() => {
      return Array.from({ length: 7 }).map((_, i) => {
         const d = new Date(currentWeekStart);
         d.setDate(currentWeekStart.getDate() + i);
         return d;
      });
   }, [currentWeekStart]);

   const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

   const filteredSchedules = useMemo(() => {
      let result = schedules;
      if (roleFilter !== 'ALL') {
         result = result.filter(s => s.role === roleFilter);
      }
      if (buildingFilter) {
         result = result.filter(s => {
            const hasShiftInBuilding = weekDates.some(date => {
               const key = formatDateKey(date);
               const raw = s.shifts[key] || [];
               const assignments = Array.isArray(raw) ? raw : [raw];
               return assignments.some(a => a.building === buildingFilter);
            });
            const isUnassigned = weekDates.every(date => {
               const key = formatDateKey(date);
               const raw = s.shifts[key] || [];
               const assignments = Array.isArray(raw) ? raw : [raw];
               return assignments.length === 0 || assignments.every(a => !a.building);
            });
            return hasShiftInBuilding || isUnassigned;
         });
      }
      if (floorFilter) {
         result = result.filter(s => {
            const hasShiftInFloor = weekDates.some(date => {
               const key = formatDateKey(date);
               const raw = s.shifts[key] || [];
               const assignments = Array.isArray(raw) ? raw : [raw];
               return assignments.some(a => a.floor === floorFilter);
            });
            const isUnassigned = weekDates.every(date => {
               const key = formatDateKey(date);
               const raw = s.shifts[key] || [];
               const assignments = Array.isArray(raw) ? raw : [raw];
               return assignments.length === 0;
            });
            return hasShiftInFloor || isUnassigned;
         });
      }
      return result;
   }, [schedules, roleFilter, buildingFilter, floorFilter, weekDates]);

   // Calculate daily coverage stats
   const dailyStats = weekDates.map(date => {
      const key = formatDateKey(date);
      let morning = 0, afternoon = 0, night = 0;
      filteredSchedules.forEach(s => {
         const raw = s.shifts[key] || [];
         const assignments = Array.isArray(raw) ? raw : [raw];
         assignments.forEach(a => {
            const matchBuilding = !buildingFilter || a.building === buildingFilter;
            const matchFloor = !floorFilter || a.floor === floorFilter;
            if (matchBuilding && matchFloor) {
               if (a.shift === 'Morning') morning++;
               else if (a.shift === 'Afternoon') afternoon++;
               else if (a.shift === 'Night') night++;
            }
         });
      });
      return { date: key, morning, afternoon, night };
   });

   const handleWeekChange = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentWeekStart(newDate);
   };

   const handleAddStaffSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newStaffName.trim()) return;

      const newStaff: StaffSchedule = {
         userId: `U${Date.now()}`,
         userName: newStaffName,
         role: newStaffRole,
         shifts: {}
      };

      try {
         await addStaff(newStaff);
         setNewStaffName('');
         addToast('success', 'Thêm thành công', `Đã thêm nhân viên ${newStaffName}`);
      } catch (error) {
         addToast('error', 'Lỗi', 'Không thể thêm nhân viên');
      }
   };

   const handleRemoveStaff = async (userId: string, userName: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa ${userName} khỏi lịch trực?`)) {
         try {
            await removeStaff(userId);
            addToast('info', 'Đã xóa', `Đã xóa nhân viên ${userName}`);
         } catch (error) {
            addToast('error', 'Lỗi', 'Không thể xóa nhân viên');
         }
      }
   };

   const exportCSV = () => {
      try {
         // Header row
         const header = ['ID', 'Tên nhân viên', 'Chức vụ', ...weekDates.map(d => d.toLocaleDateString('vi-VN'))];

         // Data rows
         const rows = filteredSchedules.map(s => {
            const shifts = weekDates.map(d => {
               const raw = s.shifts[formatDateKey(d)] || [];
               const assignments = Array.isArray(raw) ? raw : [raw];
               if (assignments.length === 0) return 'OFF';
               return assignments.map(a => {
                  const label = SHIFT_CONFIG[a.shift]?.label || a.shift;
                  const loc = a.building ? `(${a.floor}-${a.building})` : '';
                  return `${label}${loc}`;
               }).join(' + ');
            });
            const roleLabel = ROLES[s.role as keyof typeof ROLES]?.label || s.role;
            return [s.userId, s.userName, roleLabel, ...shifts];
         });

         // Combine and CSV format
         const csvContent = [
            header.join(','),
            ...rows.map(r => r.join(','))
         ].join('\n');

         // Create download link
         const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', `lich_truc_${formatDateKey(currentWeekStart)}.csv`);
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);

         addToast('success', 'Xuất thành công', 'File lịch trực đã được tải xuống.');
      } catch (error) {
         console.error(error);
         addToast('error', 'Lỗi', 'Không thể xuất file.');
      }
   };

   return (
      <div className="h-[calc(100vh-6rem)] flex flex-col bg-slate-50/50 -m-6">
         <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <ScheduleSidebar
               activeBuilding={buildingFilter}
               activeFloor={floorFilter}
               onSelect={(b, f) => {
                  setBuildingFilter(b);
                  setFloorFilter(f);
               }}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50/50">
               {/* Header Toolbar */}
               <div className="p-4 pb-2">
                  <ScheduleHeader
                     weekStart={currentWeekStart}
                     onWeekChange={handleWeekChange}
                     onDateSelect={(d) => {
                        const day = d.getDay();
                        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                        const newWeekStart = new Date(d.setDate(diff));
                        setCurrentWeekStart(newWeekStart);
                     }}
                     roleFilter={roleFilter}
                     onRoleFilterChange={setRoleFilter}
                     onExport={exportCSV}
                     isEditing={isEditing}
                     onToggleEdit={() => {
                        if (isEditing) addToast('success', 'Đã lưu', 'Cập nhật lịch trực thành công');
                        setIsEditing(!isEditing);
                     }}
                     onManageStaff={() => setShowManageStaff(true)}
                  />
               </div>

               {/* Scrollable Grid Area */}
               <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {(buildingFilter || floorFilter) && (
                     <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold text-xs uppercase tracking-wider">
                           Đang lọc
                        </span>
                        <span className="font-semibold text-slate-700">
                           {buildingFilter || 'Tất cả'} {floorFilter && ` > ${floorFilter}`}
                        </span>
                        <span className="text-slate-400 mx-2">|</span>
                        <span>Hiển thị: <b>{filteredSchedules.length}</b> nhân viên (bao gồm nhân viên chưa phân công)</span>
                     </div>
                  )}

                  <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${isEditing ? 'border-blue-300 ring-4 ring-blue-50/50' : 'border-slate-200'}`}>
                     <div className="overflow-x-auto">
                        <div className="min-w-[1000px]">
                           {/* Table Header */}
                           <div className="flex">
                              <div className="w-64 p-4 border-b border-r border-slate-200 bg-slate-50/80 backdrop-blur sticky left-0 z-20 flex items-center">
                                 <Users className="w-4 h-4 text-slate-400 mr-2" />
                                 <span className="font-bold text-slate-700">Nhân viên</span>
                              </div>
                              <div className="flex-1 grid grid-cols-7">
                                 {weekDates.map(date => {
                                    const isToday = formatDateKey(date) === formatDateKey(new Date());
                                    return (
                                       <div key={date.toISOString()} className={`p-3 border-b border-r border-slate-100 text-center ${isToday ? 'bg-blue-50/30' : 'bg-slate-50/30'}`}>
                                          <p className={`text-xs uppercase font-bold ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                                             {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                          </p>
                                          <p className={`text-sm font-semibold ${isToday ? 'text-blue-800' : 'text-slate-700'}`}>
                                             {date.getDate()}/{date.getMonth() + 1}
                                          </p>
                                       </div>
                                    )
                                 })}
                              </div>
                           </div>

                           {/* Table Body */}
                           <div className="divide-y divide-slate-100">
                              {filteredSchedules.length === 0 ? (
                                 <div className="p-8 text-center text-slate-400 italic">
                                    Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                                 </div>
                              ) : filteredSchedules.map(schedule => {
                                 const roleConfig = ROLES[schedule.role as keyof typeof ROLES] || ROLES.NURSE;
                                 return (
                                    <div key={schedule.userId} className="flex group hover:bg-slate-50/50 transition-colors">
                                       {/* Sticky Staff Info Nameplate */}
                                       <div className="w-64 p-3 border-r border-slate-100 sticky left-0 bg-white z-10 flex items-center gap-3 group-hover:bg-slate-50 transition-colors shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white ${roleConfig.color}`}>
                                             {schedule.userName.charAt(0)}
                                          </div>
                                          <div className="min-w-0">
                                             <p className="font-bold text-sm text-slate-800 truncate">{schedule.userName}</p>
                                             <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium truncate uppercase tracking-wider">
                                                   {roleConfig.label}
                                                </span>
                                             </div>
                                          </div>
                                       </div>

                                       {/* Shift Cells */}
                                       <div className="flex-1 grid grid-cols-7 relative z-0">
                                          {weekDates.map(date => {
                                             const dateKey = formatDateKey(date);
                                             return (
                                                <ShiftCell
                                                   key={`${schedule.userId}-${dateKey}`}
                                                   assignments={(() => {
                                                      const raw = schedule.shifts[dateKey] || [];
                                                      return Array.isArray(raw) ? raw : [raw];
                                                   })()}
                                                   onChange={(newAssignments) => updateSchedule(schedule.userId, dateKey, newAssignments)}
                                                   isEditing={isEditing}
                                                   defaultBuilding={buildingFilter}
                                                   defaultFloor={floorFilter}
                                                />
                                             );
                                          })}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Stats Section */}
                  <div className="mt-6 mb-12">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" /> Thống kê hoạt động
                     </h3>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm min-w-[800px]">
                              <thead>
                                 <tr className="border-b border-slate-100">
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ca trực</th>
                                    {weekDates.map(d => (
                                       <th key={d.toISOString()} className="px-4 py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                          {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                       </th>
                                    ))}
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 <tr>
                                    <td className="px-4 py-3 font-bold text-slate-700 flex items-center gap-2">
                                       <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm ring-2 ring-yellow-100"></div> Sáng
                                    </td>
                                    {dailyStats.map((stat, i) => (
                                       <td key={i} className={`px-4 py-3 text-center font-medium ${stat.morning < 2 ? 'text-red-500 bg-red-50 rounded' : 'text-slate-600'}`}>
                                          {stat.morning}
                                       </td>
                                    ))}
                                 </tr>
                                 <tr>
                                    <td className="px-4 py-3 font-bold text-slate-700 flex items-center gap-2">
                                       <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm ring-2 ring-blue-100"></div> Chiều
                                    </td>
                                    {dailyStats.map((stat, i) => (
                                       <td key={i} className={`px-4 py-3 text-center font-medium ${stat.afternoon < 2 ? 'text-red-500 bg-red-50 rounded' : 'text-slate-600'}`}>
                                          {stat.afternoon}
                                       </td>
                                    ))}
                                 </tr>
                                 <tr>
                                    <td className="px-4 py-3 font-bold text-slate-700 flex items-center gap-2">
                                       <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-sm ring-2 ring-indigo-100"></div> Đêm
                                    </td>
                                    {dailyStats.map((stat, i) => (
                                       <td key={i} className={`px-4 py-3 text-center font-medium ${stat.night < 1 ? 'text-red-500 bg-red-50 rounded' : 'text-slate-600'}`}>
                                          {stat.night}
                                       </td>
                                    ))}
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Manage Staff Modal */}
         {showManageStaff && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-slate-800">Quản lý nhân viên</h3>
                     <button onClick={() => setShowManageStaff(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  {/* Add Staff Form */}
                  <form onSubmit={handleAddStaffSubmit} className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200 flex gap-3 items-end ring-1 ring-slate-100">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên nhân viên</label>
                        <input
                           type="text"
                           required
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                           placeholder="Nhập tên nhân viên..."
                           value={newStaffName}
                           onChange={e => setNewStaffName(e.target.value)}
                        />
                     </div>
                     <div className="w-48">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chức vụ</label>
                        <select
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white transition-all"
                           value={newStaffRole}
                           onChange={e => setNewStaffRole(e.target.value)}
                        >
                           {Object.entries(ROLES).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                           ))}
                        </select>
                     </div>

                     <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm text-sm h-[38px]">
                        <Plus className="w-4 h-4" /> Thêm
                     </button>
                  </form>

                  {/* Staff List */}
                  <div className="space-y-3">
                     <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        Danh sách nhân viên ({schedules.length})
                     </h4>
                     <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                           {schedules.map(staff => (
                              <div key={staff.userId} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${ROLES[staff.role as keyof typeof ROLES]?.color || 'bg-slate-400'}`}>
                                       {staff.userName.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="font-bold text-sm text-slate-800">{staff.userName}</p>
                                       <p className="text-xs text-slate-500 font-medium">
                                          {ROLES[staff.role as keyof typeof ROLES]?.label || staff.role}
                                       </p>
                                    </div>
                                 </div>
                                 <button
                                    onClick={() => handleRemoveStaff(staff.userId, staff.userName)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                           {schedules.length === 0 && (
                              <div className="p-12 text-center text-slate-400">
                                 <div className="mb-2 mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-slate-300" />
                                 </div>
                                 Chưa có nhân viên nào.
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};