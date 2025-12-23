import React from 'react';
import { Scale } from 'lucide-react';

export const WeightTrackingPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Theo dõi cân nặng</h1>
                        <p className="text-sm text-slate-500">Ghi nhận cân nặng định kỳ hàng tháng</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-8 text-center rounded-xl border border-slate-200">
                <p className="text-slate-500">Chức năng đang phát triển</p>
            </div>
        </div>
    );
};
