import React from 'react';
import { User, Phone, MapPin } from 'lucide-react';
import { Resident } from '@/src/types/index';
import { useToast } from '@/src/app/providers';

export const GuardianInfo = ({ resident }: { resident: Resident }) => {
    const { addToast } = useToast();

    return (
        <div className="max-w-lg">
            <h3 className="font-semibold text-slate-800 mb-4">Thông tin liên hệ chính</h3>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-lg text-slate-800">{resident.guardianName}</p>
                        <p className="text-sm text-slate-500">Mối quan hệ: Con trai</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-medium">{resident.guardianPhone}</span>
                        <button
                            onClick={() => addToast('info', 'Đang kết nối', `Đang gọi cho ${resident.guardianName}...`)}
                            className="text-xs bg-white border border-slate-300 px-2 py-1 rounded ml-auto hover:bg-slate-100 active:bg-slate-200"
                        >
                            Gọi điện
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 text-sm">123 Nguyễn Văn Linh, Q.7, TP.HCM</span>
                    </div>
                </div>
            </div>
        </div>
    );
};