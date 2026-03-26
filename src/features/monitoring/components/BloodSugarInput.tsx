import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Activity } from 'lucide-react';
import { BloodSugarRecord } from '@/src/types';

interface BloodSugarInputProps {
    initialData?: BloodSugarRecord;
    onSave: (data: Partial<BloodSugarRecord>) => Promise<void>;
    readOnly?: boolean;
}

export const BloodSugarInput = ({ initialData, onSave, readOnly = false }: BloodSugarInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    // Position state
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLDivElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        morningBeforeMeal: initialData?.morningBeforeMeal?.toString() || '',
        morningAfterMeal: initialData?.morningAfterMeal?.toString() || '',
        lunchBeforeMeal: initialData?.lunchBeforeMeal?.toString() || '',
        lunchAfterMeal: initialData?.lunchAfterMeal?.toString() || '',
        dinnerBeforeMeal: initialData?.dinnerBeforeMeal?.toString() || '',
        dinnerAfterMeal: initialData?.dinnerAfterMeal?.toString() || '',
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                morningBeforeMeal: initialData?.morningBeforeMeal?.toString() || '',
                morningAfterMeal: initialData?.morningAfterMeal?.toString() || '',
                lunchBeforeMeal: initialData?.lunchBeforeMeal?.toString() || '',
                lunchAfterMeal: initialData?.lunchAfterMeal?.toString() || '',
                dinnerBeforeMeal: initialData?.dinnerBeforeMeal?.toString() || '',
                dinnerAfterMeal: initialData?.dinnerAfterMeal?.toString() || '',
            });
        }
    }, [isOpen, initialData]);

    const handleOpen = () => {
        if (readOnly) return;
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Calculate best position (prefer bottom right, fallback to available space)
            // A simple logic: align right edge of popover with right edge of cell?
            // or just center? Let's try to center below.
            // Popover width approx 300px.
            let left = rect.left + window.scrollX - 100; // Shift left a bit
            const top = rect.bottom + window.scrollY + 5;

            // Boundary checks (basic)
            if (left < 10) left = 10;

            setCoords({ top, left });
            setIsOpen(true);
        }
    };

    const handleClose = () => setIsOpen(false);

    const handleChange = (field: keyof typeof formData, value: string) => {
        if (readOnly) return;
        // Allow only numbers and dots
        if (!/^\d*\.?\d*$/.test(value)) return;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (readOnly) return;
        const payload: Partial<BloodSugarRecord> = {};

        const parse = (val: string) => val ? parseFloat(val) : undefined;

        payload.morningBeforeMeal = parse(formData.morningBeforeMeal);
        payload.morningAfterMeal = parse(formData.morningAfterMeal);
        payload.lunchBeforeMeal = parse(formData.lunchBeforeMeal);
        payload.lunchAfterMeal = parse(formData.lunchAfterMeal);
        payload.dinnerBeforeMeal = parse(formData.dinnerBeforeMeal);
        payload.dinnerAfterMeal = parse(formData.dinnerAfterMeal);

        await onSave(payload);
        setIsOpen(false);
    };

    // Compact display string
    const getDisplayString = () => {
        if (!initialData) return '';
        const parts = [];
        if (initialData.morningBeforeMeal || initialData.morningAfterMeal) {
            parts.push(`S:${initialData.morningBeforeMeal || '-'}/${initialData.morningAfterMeal || '-'}`);
        }
        if (initialData.lunchBeforeMeal || initialData.lunchAfterMeal) {
            parts.push(`Tr:${initialData.lunchBeforeMeal || '-'}/${initialData.lunchAfterMeal || '-'}`);
        }
        if (initialData.dinnerBeforeMeal || initialData.dinnerAfterMeal) {
            parts.push(`T:${initialData.dinnerBeforeMeal || '-'}/${initialData.dinnerAfterMeal || '-'}`);
        }
        return parts.join(' ');
    };

    const display = getDisplayString();

    return (
        <>
            <div
                ref={buttonRef}
                onClick={handleOpen}
                className={`w-full h-full min-h-[32px] p-1 flex items-center justify-center cursor-pointer hover:bg-orange-50 transition-colors ${readOnly ? 'cursor-default' : ''}`}
                title="Click để nhập chi tiết đường máu"
            >
                {display ? (
                    <span className="text-[10px] whitespace-nowrap overflow-hidden text-overflow-ellipsis text-orange-800 font-medium">
                        {display}
                    </span>
                ) : (
                    !readOnly && <Activity className="w-3 h-3 text-orange-300 opacity-50" />
                )}
            </div>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-start justify-start" onClick={handleClose}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/5" />

                    {/* Popover Content */}
                    <div
                        className="relative bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            top: coords.top,
                            left: coords.left,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4 text-orange-600" />
                                Nhập chỉ số đường máu
                            </h3>
                            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Morning */}
                            <div className="grid grid-cols-6 gap-2 items-center">
                                <span className="col-span-2 text-xs font-medium text-slate-600">Sáng</span>
                                <div className="col-span-2">
                                    <input
                                        placeholder="Trước ăn"
                                        className="w-full text-xs p-1.5 border border-slate-300 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        value={formData.morningBeforeMeal}
                                        disabled={readOnly}
                                        onChange={e => handleChange('morningBeforeMeal', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        placeholder="Sau ăn"
                                        className="w-full text-xs p-1.5 border border-slate-300 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        value={formData.morningAfterMeal}
                                        disabled={readOnly}
                                        onChange={e => handleChange('morningAfterMeal', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Lunch */}
                            <div className="grid grid-cols-6 gap-2 items-center">
                                <span className="col-span-2 text-xs font-medium text-slate-600">Trưa</span>
                                <div className="col-span-2">
                                    <input
                                        placeholder="Trước ăn"
                                        className="w-full text-xs p-1.5 border border-slate-300 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        value={formData.lunchBeforeMeal}
                                        disabled={readOnly}
                                        onChange={e => handleChange('lunchBeforeMeal', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        placeholder="Sau ăn"
                                        className="w-full text-xs p-1.5 border border-slate-300 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        value={formData.lunchAfterMeal}
                                        disabled={readOnly}
                                        onChange={e => handleChange('lunchAfterMeal', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Dinner */}
                            <div className="grid grid-cols-6 gap-2 items-center">
                                <span className="col-span-2 text-xs font-medium text-slate-600">Tối</span>
                                <div className="col-span-2">
                                    <input
                                        placeholder="Trước ăn"
                                        className="w-full text-xs p-1.5 border border-slate-300 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        value={formData.dinnerBeforeMeal}
                                        disabled={readOnly}
                                        onChange={e => handleChange('dinnerBeforeMeal', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        placeholder="Sau ăn"
                                        className="w-full text-xs p-1.5 border border-slate-300 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        value={formData.dinnerAfterMeal}
                                        disabled={readOnly}
                                        onChange={e => handleChange('dinnerAfterMeal', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={handleClose}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={readOnly}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded flex items-center gap-1 shadow-sm shadow-teal-200"
                            >
                                <Check className="w-3 h-3" />
                                Lưu chỉ số
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
