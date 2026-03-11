import React, { useState, useEffect } from 'react';
import { IVDripItem, IV_FLUID_LABELS } from '@/src/types';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface IVDripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (items: IVDripItem[]) => Promise<void>;
    initialItems: IVDripItem[];
    residentName: string;
    recordDate: string;
}

export const IVDripModal = ({ isOpen, onClose, onSave, initialItems, residentName, recordDate }: IVDripModalProps) => {
    const [items, setItems] = useState<IVDripItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setItems(initialItems.length > 0 ? [...initialItems] : []);
        }
    }, [isOpen, initialItems]);

    const handleAddItem = () => {
        setItems([...items, { fluid: 'nacl', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleUpdateItem = (index: number, field: keyof IVDripItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSave = async () => {
        if (items.length === 0) {
            // Allow saving empty to clear records? Or maybe prompt
            // For now assume user can clear all items to remove IV drip record
        }

        setIsSaving(true);
        try {
            await onSave(items);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi lưu thông tin truyền dịch');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800">Truyền dịch: {residentName}</h3>
                        <p className="text-xs text-slate-500">Ngày: {recordDate}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            Chưa có dịch truyền nào
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <span className="font-bold text-slate-400 w-6">{index + 1}.</span>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Loại dịch</label>
                                    <select
                                        className="w-full p-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={item.fluid}
                                        onChange={(e) => handleUpdateItem(index, 'fluid', e.target.value)}
                                    >
                                        {Object.entries(IV_FLUID_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Số lượng</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="self-end pb-1">
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    <button
                        onClick={handleAddItem}
                        className="w-full py-3 flex items-center justify-center gap-2 text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 rounded-lg border border-dashed border-blue-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm loại dịch
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Lưu lại
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
