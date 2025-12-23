import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Tag, List, Save, X } from 'lucide-react';
import { ServicePrice } from '@/src/types/index';
import { formatCurrency } from '@/src/data/index';

const serviceSchema = z.object({
    name: z.string().min(2, 'Tên dịch vụ quá ngắn'),
    category: z.enum(['ROOM', 'CARE', 'MEAL', 'OTHER']),
    price: z.number().min(0, 'Giá không được âm'),
    unit: z.string().optional(),
    billingType: z.enum(['FIXED', 'ONE_OFF'])
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
    defaultValues?: ServiceFormData;
    onSave: (data: ServiceFormData) => void;
    onCancel: () => void;
}

const ServiceForm = ({ defaultValues, onSave, onCancel }: ServiceFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: defaultValues || {
            name: '',
            category: 'OTHER',
            price: 0,
            unit: 'Lần',
            billingType: 'FIXED'
        }
    });

    return (
        <form onSubmit={handleSubmit(onSave)} className="p-4 bg-teal-50 border-b border-teal-100 grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
            <div className="md:col-span-2">
                <label className="text-xs font-semibold text-teal-800 mb-1 block">Tên dịch vụ</label>
                <input
                    {...register('name')}
                    className={`w-full border rounded px-2 py-1.5 text-sm ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="VD: Vật lý trị liệu..."
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div>
                <label className="text-xs font-semibold text-teal-800 mb-1 block">Loại phí</label>
                <select
                    {...register('billingType')}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                >
                    <option value="FIXED">Cố định tháng</option>
                    <option value="ONE_OFF">Phát sinh</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-semibold text-teal-800 mb-1 block">Danh mục</label>
                <select
                    {...register('category')}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                >
                    <option value="ROOM">Phòng ở</option>
                    <option value="CARE">Chăm sóc</option>
                    <option value="MEAL">Dinh dưỡng</option>
                    <option value="OTHER">Khác</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-semibold text-teal-800 mb-1 block">Đơn giá</label>
                <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    className={`w-full border rounded px-2 py-1.5 text-sm ${errors.price ? 'border-red-500' : ''}`}
                />
                {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>
            <div className="flex gap-2 pt-5">
                <button type="submit" className="flex-1 bg-teal-600 text-white py-1.5 rounded text-sm font-medium hover:bg-teal-700 flex items-center justify-center gap-1">
                    <Save className="w-3 h-3" /> Lưu
                </button>
                <button type="button" onClick={onCancel} className="px-3 bg-white border border-slate-300 rounded text-sm hover:bg-slate-50 flex items-center justify-center gap-1">
                    <X className="w-3 h-3" />
                </button>
            </div>
        </form>
    );
};

interface ServiceCatalogProps {
    services: ServicePrice[];
    onAdd: (s: ServicePrice) => void;
    onUpdate: (s: ServicePrice) => void;
    onDelete: (id: string) => void;
    onRecordUsage: (s: ServicePrice) => void;
}

export const ServiceCatalog = ({ services, onAdd, onUpdate, onDelete, onRecordUsage }: ServiceCatalogProps) => {
    const [activeTab, setActiveTab] = useState<'FIXED' | 'ONE_OFF'>('FIXED');
    const [isEditing, setIsEditing] = useState<ServicePrice | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const categories = {
        'ROOM': { label: 'Phòng ở', color: 'bg-blue-100 text-blue-800' },
        'CARE': { label: 'Chăm sóc', color: 'bg-green-100 text-green-800' },
        'MEAL': { label: 'Dinh dưỡng', color: 'bg-orange-100 text-orange-800' },
        'OTHER': { label: 'Dịch vụ khác', color: 'bg-purple-100 text-purple-800' },
    };

    const handleFormSave = (data: ServiceFormData) => {
        const newService: ServicePrice = {
            id: isEditing ? isEditing.id : `SVC-${Date.now()}`,
            name: data.name,
            category: data.category,
            price: data.price,
            unit: data.unit || 'Lần',
            billingType: data.billingType
        };

        if (isEditing) {
            onUpdate(newService);
        } else {
            onAdd(newService);
        }

        setIsEditing(null);
        setIsCreating(false);
    };

    const filteredServices = services.filter(s => {
        // Fallback or explicit check
        const type = s.billingType || (['ROOM', 'CARE', 'MEAL'].includes(s.category) ? 'FIXED' : 'ONE_OFF');
        return type === activeTab;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <List className="w-5 h-5 text-teal-600" /> Danh mục dịch vụ
                </h3>
                <div className="flex bg-slate-200 rounded-lg p-1 text-sm font-medium">
                    <button
                        onClick={() => setActiveTab('FIXED')}
                        className={`px-3 py-1 rounded-md transition-all ${activeTab === 'FIXED' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Cố định tháng
                    </button>
                    <button
                        onClick={() => setActiveTab('ONE_OFF')}
                        className={`px-3 py-1 rounded-md transition-all ${activeTab === 'ONE_OFF' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Phát sinh
                    </button>
                </div>
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setIsEditing(null);
                    }}
                    className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Thêm dịch vụ
                </button>
            </div>

            {(isCreating || isEditing) && (
                <ServiceForm
                    defaultValues={isEditing ? {
                        name: isEditing.name,
                        category: isEditing.category,
                        price: isEditing.price,
                        unit: isEditing.unit,
                        billingType: isEditing.billingType || 'FIXED'
                    } : {
                        name: '',
                        category: 'OTHER',
                        price: 0,
                        unit: 'Lần',
                        billingType: activeTab
                    }}
                    onSave={handleFormSave}
                    onCancel={() => { setIsCreating(false); setIsEditing(null); }}
                />
            )}

            <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-slate-500">Tên dịch vụ</th>
                            <th className="px-4 py-2 text-slate-500">Danh mục</th>
                            <th className="px-4 py-2 text-slate-500">Loại</th>
                            <th className="px-4 py-2 text-slate-500 text-right">Đơn giá</th>
                            <th className="px-4 py-2 text-slate-500 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredServices.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 group">
                                <td className="px-4 py-3 font-medium text-slate-700">{s.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categories[s.category]?.color || 'bg-slate-100'}`}>
                                        {categories[s.category]?.label || s.category}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs">
                                    {s.billingType === 'FIXED' ? 'Định kỳ' : 'Theo lượt'}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-slate-600">
                                    {formatCurrency(s.price)} <span className="text-xs font-normal text-slate-400">/{s.unit}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onRecordUsage(s)}
                                            className="bg-green-100 text-green-700 p-1.5 rounded hover:bg-green-200"
                                            title="Ghi nhận sử dụng"
                                        >
                                            <Tag className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(s); setIsCreating(false); }}
                                            className="bg-blue-100 text-blue-700 p-1.5 rounded hover:bg-blue-200"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(s.id)}
                                            className="bg-red-100 text-red-700 p-1.5 rounded hover:bg-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredServices.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-400 italic">Chưa có dịch vụ nào trong danh mục này</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
