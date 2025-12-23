import React, { useState } from 'react';
import { X, User, Save } from 'lucide-react';
import { Resident } from '../../../types/index';

export const AssessmentWizard = ({ resident, onSave, onCancel }: { resident: Resident, onSave: (score: number) => void, onCancel: () => void }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const sections = [
    {
      title: "1. Sinh hoạt hàng ngày (ADLs)",
      items: [
        { id: 'adl_bath', label: 'Tắm rửa' },
        { id: 'adl_dress', label: 'Mặc quần áo' },
        { id: 'adl_toilet', label: 'Đi vệ sinh' },
        { id: 'adl_eat', label: 'Ăn uống' },
        { id: 'adl_move', label: 'Di chuyển' },
        { id: 'adl_hygiene', label: 'Vệ sinh cá nhân' }
      ]
    },
    {
      title: "2. Nhận thức",
      items: [
        { id: 'cog_orient', label: 'Định hướng (Không gian/Thời gian)' },
        { id: 'cog_mem', label: 'Trí nhớ' },
        { id: 'cog_comm', label: 'Giao tiếp' },
        { id: 'cog_safe', label: 'Nhận thức an toàn' }
      ]
    },
    {
      title: "3. Y tế",
      items: [
        { id: 'med_drug', label: 'Quản lý thuốc' },
        { id: 'med_cath', label: 'Chăm sóc ống thông (Sonde)' },
        { id: 'med_wound', label: 'Chăm sóc vết thương' },
        { id: 'med_monitor', label: 'Theo dõi sinh hiệu' }
      ]
    },
    {
       title: "4. Hành vi",
       items: [
          { id: 'beh_social', label: 'Tham gia xã hội' },
          { id: 'beh_agit', label: 'Kích động/Gây gổ' },
          { id: 'beh_sleep', label: 'Rối loạn giấc ngủ' },
          { id: 'beh_fall', label: 'Nguy cơ té ngã' }
       ]
    }
  ];

  const calculateTotal = () => Object.values(scores).reduce((a, b) => a + b, 0);
  const totalScore = calculateTotal();
  
  const getLevel = (score: number) => {
     if (score <= 10) return 1;
     if (score <= 20) return 2;
     if (score <= 30) return 3;
     return 4;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Đánh giá cấp độ chăm sóc</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4 border border-blue-100">
              <User className="w-10 h-10 text-blue-500 bg-white rounded-full p-2" />
              <div>
                 <p className="font-bold text-slate-800">{resident.name}</p>
                 <p className="text-sm text-slate-600">Đánh giá hiện tại: <span className="font-bold">Cấp độ {resident.careLevel}</span></p>
              </div>
           </div>

           {sections.map((section, idx) => (
              <div key={idx}>
                 <h3 className="font-bold text-slate-800 mb-3 uppercase text-sm tracking-wider">{section.title}</h3>
                 <div className="space-y-3">
                    {section.items.map(item => (
                       <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          <div className="flex gap-2">
                             {[0, 1, 2].map(point => (
                                <button
                                   key={point}
                                   onClick={() => setScores(prev => ({...prev, [item.id]: point}))}
                                   className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                      scores[item.id] === point 
                                      ? 'bg-teal-600 text-white shadow-md scale-110' 
                                      : 'bg-white border border-slate-300 text-slate-400 hover:border-teal-500'
                                   }`}
                                >
                                   {point}
                                </button>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           ))}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
           <div>
              <p className="text-sm text-slate-500">Tổng điểm</p>
              <p className="text-2xl font-bold text-slate-800">{totalScore} <span className="text-sm font-normal text-slate-400">/ 40</span></p>
           </div>
           <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg font-bold border ${
                 getLevel(totalScore) === 1 ? 'bg-green-100 text-green-700 border-green-200' :
                 getLevel(totalScore) === 2 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                 getLevel(totalScore) === 3 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                 'bg-red-100 text-red-700 border-red-200'
              }`}>
                 Đề xuất: Cấp độ {getLevel(totalScore)}
              </div>
              <button 
                 onClick={() => onSave(totalScore)}
                 className="bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg shadow-teal-900/10"
              >
                 <Save className="w-4 h-4" /> Lưu kết quả
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};