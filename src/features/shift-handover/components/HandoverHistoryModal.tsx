import React from 'react';
import { ShiftHandover } from '@/src/types';
import { X, Calendar, User, FileText } from 'lucide-react';

interface HandoverHistoryModalProps {
    handovers: ShiftHandover[];
    onClose: () => void;
}

export const HandoverHistoryModal = ({ handovers, onClose }: HandoverHistoryModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Lịch sử Giao Ca</h2>
                            <p className="text-sm text-slate-500">Danh sách các biên bản đã lưu</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {handovers.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 font-medium">
                            Chưa có biên bản nào.
                        </div>
                    ) : (
                        handovers.map(h => (
                            <div key={h.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="font-bold text-slate-800">
                                            {new Date(h.shiftDate).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="text-slate-400">|</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${h.shiftTime === '06:00' ? 'bg-yellow-100 text-yellow-700' :
                                                h.shiftTime === '14:00' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            Ca {h.shiftTime}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <User className="w-4 h-4" />
                                        <span>Giao: <b>{h.handoverStaff.join(', ')}</b></span>
                                        <span>→</span>
                                        <span>Nhận: <b>{h.receiverStaff.join(', ')}</b></span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {(h.notes || []).map((note: any) => (
                                        <div key={note.id} className="p-3 bg-slate-50 text-slate-700 rounded-lg text-sm border border-slate-100 flex gap-2">
                                            <span className="font-bold text-slate-900 shrink-0">{note.residentName}:</span>
                                            <span>{note.content}</span>
                                        </div>
                                    ))}
                                    {(!h.notes || h.notes.length === 0) && (
                                        <p className="text-sm text-slate-400 italic pl-2">Không có ghi chú đặc biệt</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};
