import React from 'react';
import { ChefHat, AlertTriangle, FileText, Coffee, Soup, AlertCircle } from 'lucide-react';
import { Resident } from '@/src/types/index';

const DIET_CONFIG: Record<string, { label: string; color: string; icon: any; description: string }> = {
    Normal: { label: 'Cơm (Thường)', color: 'bg-green-100 text-green-800', icon: ChefHat, description: 'Chế độ ăn tiêu chuẩn, không kiêng khem đặc biệt.' },
    Porridge: { label: 'Cháo', color: 'bg-yellow-100 text-yellow-800', icon: Coffee, description: 'Thức ăn mềm, dễ tiêu hóa.' },
    Soup: { label: 'Súp', color: 'bg-orange-100 text-orange-800', icon: Soup, description: 'Thức ăn lỏng.' },
    Pureed: { label: 'Xay', color: 'bg-purple-100 text-purple-800', icon: Soup, description: 'Thức ăn xay nhuyễn.' },
    Tube: { label: 'Ăn qua Sonde', color: 'bg-red-100 text-red-800', icon: AlertCircle, description: 'Nuôi ăn qua ống thông dạ dày.' },
    Cut: { label: 'Cắt cơm', color: 'bg-slate-100 text-slate-800', icon: FileText, description: 'Ngừng cung cấp suất ăn (Về nhà/Nhập viện).' },
};

export const ResidentNutritionSection = ({ resident, onEdit }: { resident: Resident, onEdit: () => void }) => {
    const diet = DIET_CONFIG[resident.dietType || 'Normal'] || DIET_CONFIG.Normal;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Diet Status */}
                <div className={`p-6 rounded-xl border ${diet.color} bg-opacity-30 flex flex-col items-center text-center`}>
                    <div className={`p-4 rounded-full bg-white mb-4 shadow-sm`}>
                        <diet.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{diet.label}</h3>
                    <p className="text-sm opacity-80 mb-6">{diet.description}</p>

                    <button
                        onClick={onEdit}
                        className="bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 border border-slate-200"
                    >
                        Thay đổi chế độ
                    </button>
                </div>

                {/* Notes & Allergies */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" /> Ghi chú đặc biệt
                        </h4>
                        {resident.dietNote ? (
                            <p className="text-slate-700 whitespace-pre-wrap">{resident.dietNote}</p>
                        ) : (
                            <p className="text-slate-400 italic text-sm">Không có ghi chú đặc biệt.</p>
                        )}
                    </div>

                    <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                        <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Dị ứng thực phẩm
                        </h4>
                        <div className="space-y-2">
                            {resident.allergies && resident.allergies.length > 0 ? (
                                resident.allergies.map(a => (
                                    <div key={a.id} className="flex justify-between items-center bg-white p-2 rounded border border-red-100">
                                        <span className="font-medium text-red-900 text-sm">{a.allergen}</span>
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{a.reaction}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 italic text-sm">Chưa ghi nhận dị ứng.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
