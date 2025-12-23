import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, MapPin, User, Clock, Music, Heart, BookOpen, Sun, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ActivityEvent } from '../../../types/index';
import { CreateActivityModal } from '../components/CreateActivityModal';
import { Button } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { useActivitiesStore } from '../../../stores/activitiesStore';

export const ActivitiesPage = () => {
   const { user } = useAuthStore();
   const { activities, addActivity } = useActivitiesStore();
   const [showModal, setShowModal] = useState(false);
   const [filterType, setFilterType] = useState('All');

   if (!user) return null;

   // Sort by date and time
   const sortedActivities = [...activities].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
   });

   const filteredActivities = sortedActivities.filter(a => filterType === 'All' || a.type === filterType);

   // Group by Date
   const groupedActivities: Record<string, ActivityEvent[]> = {};
   filteredActivities.forEach(a => {
      if (!groupedActivities[a.date]) groupedActivities[a.date] = [];
      groupedActivities[a.date].push(a);
   });

   const handleSave = async (activity: ActivityEvent) => {
      try {
         await addActivity(activity);
         setShowModal(false);
         toast.success('Đã lên lịch hoạt động mới.');
      } catch (error) {
         toast.error('Lỗi khi thêm hoạt động');
      }
   };

   const getTypeConfig = (type: string) => {
      switch (type) {
         case 'Exercise': return { icon: Heart, color: 'bg-green-100 text-green-700', label: 'Vận động' };
         case 'Social': return { icon: Sun, color: 'bg-orange-100 text-orange-700', label: 'Xã hội' };
         case 'Entertainment': return { icon: Music, color: 'bg-pink-100 text-pink-700', label: 'Giải trí' };
         case 'Education': return { icon: BookOpen, color: 'bg-blue-100 text-blue-700', label: 'Giáo dục' };
         case 'Spiritual': return { icon: Star, color: 'bg-purple-100 text-purple-700', label: 'Tâm linh' };
         default: return { icon: CalendarIcon, color: 'bg-slate-100 text-slate-700', label: 'Khác' };
      }
   };

   return (
      <div className="space-y-6">
         {showModal && (
            <CreateActivityModal
               user={user}
               onClose={() => setShowModal(false)}
               onSave={handleSave}
            />
         )}

         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Hoạt động & Sự kiện</h2>
               <p className="text-sm text-slate-500">Lịch sinh hoạt vui chơi, giải trí cho NCT</p>
            </div>
            <div className="flex gap-3 items-center w-full md:w-auto">
               <select
                  className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-teal-500"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
               >
                  <option value="All">Tất cả loại hình</option>
                  <option value="Exercise">Vận động</option>
                  <option value="Social">Xã hội</option>
                  <option value="Entertainment">Giải trí</option>
                  <option value="Spiritual">Tâm linh</option>
                  <option value="Education">Giáo dục</option>
               </select>
               <Button onClick={() => setShowModal(true)} icon={<Plus className="w-4 h-4" />}>
                  Lên lịch
               </Button>
            </div>
         </div>

         <div className="space-y-8">
            {Object.keys(groupedActivities).length > 0 ? Object.keys(groupedActivities).map(date => {
               const isToday = date === new Date().toISOString().split('T')[0];
               return (
                  <div key={date}>
                     <div className="flex items-center gap-2 mb-4">
                        <CalendarIcon className={`w-5 h-5 ${isToday ? 'text-teal-600' : 'text-slate-400'}`} />
                        <h3 className={`font-bold text-lg ${isToday ? 'text-teal-800' : 'text-slate-700'}`}>
                           {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
                           {isToday && <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full uppercase">Hôm nay</span>}
                        </h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedActivities[date].map(activity => {
                           const config = getTypeConfig(activity.type);
                           const Icon = config.icon;

                           return (
                              <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-teal-300 transition-all group flex flex-col h-full">
                                 <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${config.color}`}>
                                       <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${activity.status === 'Completed' ? 'bg-slate-100 text-slate-500' :
                                       activity.status === 'Happening' ? 'bg-green-100 text-green-700 animate-pulse' :
                                          'bg-blue-50 text-blue-600'
                                       }`}>
                                       {activity.status === 'Happening' ? 'Đang diễn ra' : activity.status === 'Completed' ? 'Đã kết thúc' : 'Sắp tới'}
                                    </span>
                                 </div>

                                 <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-teal-700 transition-colors">{activity.title}</h4>
                                 <p className="text-sm text-slate-600 mb-4 flex-1">{activity.description}</p>

                                 <div className="space-y-2 text-sm text-slate-500 border-t border-slate-100 pt-3">
                                    <div className="flex items-center gap-2">
                                       <Clock className="w-4 h-4 text-slate-400" />
                                       <span className="font-medium text-slate-700">{activity.startTime} - {activity.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <MapPin className="w-4 h-4 text-slate-400" />
                                       <span>{activity.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <User className="w-4 h-4 text-slate-400" />
                                       <span>PT: {activity.host}</span>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               );
            }) : (
               <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                     <CalendarIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-500 font-medium">Chưa có hoạt động nào được lên lịch</h3>
                  <p className="text-slate-400 text-sm mt-1">Hãy thêm hoạt động mới để làm phong phú đời sống NCT</p>
               </div>
            )}
         </div>
      </div>
   );
};