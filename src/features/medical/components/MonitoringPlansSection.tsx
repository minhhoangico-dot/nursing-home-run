import React, { useState } from 'react';
import { Eye, Plus, Activity, FileText } from 'lucide-react';
import { Resident, MonitoringPlan, User } from '../../../types/index';

const MonitoringModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (m: MonitoringPlan) => void }) => {
    const [data, setData] = useState({
        type: 'Theo dõi huyết áp',
        frequency: 'Mỗi 4 giờ',
        note: ''
    });

    const handleSave = () => {
        onSave({
            id: `M${Math.floor(Math.random() * 1000)}`,
            startDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            assigner: user.name,
            ...data
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h3 className="font-bold text-lg mb-4">Tạo kế hoạch theo dõi đặc biệt</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Loại theo dõi</label>
                        <select className="w-full border rounded p-2" value={data.type} onChange={e => setData({ ...data, type: e.target.value })}>
                            <option>Theo dõi huyết áp</option>
                            <option>Theo dõi đường huyết</option>
                            <option>Theo dõi sau té ngã</option>
                            <option>Chăm sóc vết thương</option>
                            <option>Khác</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tần suất</label>
                        <input type="text" className="w-full border rounded p-2" placeholder="VD: 2 giờ/lần" value={data.frequency} onChange={e => setData({ ...data, frequency: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ghi chú / Chỉ định</label>
                        <textarea className="w-full border rounded p-2" rows={3} placeholder="VD: Báo bác sĩ nếu HA > 160/90" value={data.note} onChange={e => setData({ ...data, note: e.target.value })}></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Lưu kế hoạch</button>
                </div>
            </div>
        </div>
    );
};

export const MonitoringPlansSection = ({ user, resident, onUpdate }: { user: User, resident: Resident, onUpdate: (r: Resident) => void }) => {
    const [showModal, setShowModal] = useState(false);

    const handleAddMonitoring = (m: MonitoringPlan) => {
        onUpdate({
            ...resident,
            specialMonitoring: [m, ...(resident.specialMonitoring || [])]
        });
        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            {showModal && <MonitoringModal user={user} onClose={() => setShowModal(false)} onSave={handleAddMonitoring} />}

            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-500" /> Kế hoạch theo dõi đặc biệt
                </h3>
                <button onClick={() => setShowModal(true)} className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tạo kế hoạch mới
                </button>
            </div>
            <div className="space-y-3">
                {resident.specialMonitoring && resident.specialMonitoring.length > 0 ? resident.specialMonitoring.map((m, i) => (
                    <div key={i} className="p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-slate-800">{m.type}</p>
                                <div className="flex gap-2 text-xs text-slate-500">
                                    <span>Bắt đầu: {m.startDate}</span>
                                    {m.assigner && <span>• Chỉ định: {m.assigner}</span>}
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{m.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-400" />
                                <span>Tần suất: <span className="font-medium">{m.frequency}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span>Ghi chú: {m.note}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 text-slate-400 italic bg-slate-50 rounded-lg border border-dashed">
                        Chưa có kế hoạch theo dõi nào đang hoạt động
                    </div>
                )}
            </div>
        </div>
    );
};