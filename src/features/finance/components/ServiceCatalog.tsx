import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Tag, List, Save, X } from 'lucide-react';
import { ServicePrice } from '@/src/types/index';
import { formatCurrency } from '@/src/data/index';
import { Table, Column } from '@/src/components/ui/Table';

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
            unit: 'Tháng',
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
    onRecordUsage?: (s: ServicePrice) => void;
    readOnly?: boolean;
}

export const ServiceCatalog = ({
    services,
    onAdd,
    onUpdate,
    onDelete,
    onRecordUsage,
    readOnly = false,
}: ServiceCatalogProps) => {
    const [activeTab, setActiveTab] = useState<'FIXED' | 'ONE_OFF'>('FIXED');
    const [isEditing, setIsEditing] = useState<ServicePrice | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const categories: Record<string, { label: string; color: string }> = {
        'ROOM': { label: 'Phòng ở', color: 'bg-blue-100 text-blue-800' },
        'CARE': { label: 'Chăm sóc', color: 'bg-green-100 text-green-800' },
        'MEAL': { label: 'Dinh dưỡng', color: 'bg-orange-100 text-orange-800' },
        'OTHER': { label: 'Dịch vụ khác', color: 'bg-purple-100 text-purple-800' },
    };

    useEffect(() => {
        if (!readOnly) {
            return;
        }

        setIsEditing(null);
        setIsCreating(false);
    }, [readOnly]);

    const handleFormSave = (data: ServiceFormData) => {
        const defaultUnit = data.billingType === 'FIXED' ? 'Tháng' : 'Lần';
        const newService: ServicePrice = {
            id: isEditing ? isEditing.id : `SVC-${Date.now()}`,
            name: data.name,
            category: data.category,
            price: data.price,
            unit: isEditing ? data.unit || defaultUnit : defaultUnit,
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
        const type = s.billingType || (['ROOM', 'CARE', 'MEAL'].includes(s.category) ? 'FIXED' : 'ONE_OFF');
        return type === activeTab;
    });

    const columns: Column<ServicePrice>[] = [
        {
            header: 'Tên dịch vụ',
            accessor: 'name',
            mobilePrimary: true,
            className: 'font-medium text-slate-700'
        },
        {
            header: 'Danh mục',
            accessor: 'category',
            mobileLabel: 'Danh mục',
            render: (s) => (
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categories[s.category]?.color || 'bg-slate-100'}`}>
                    {categories[s.category]?.label || s.category}
                </span>
            )
        },
        {
            header: 'Loại',
            accessor: 'billingType',
            mobileHidden: true,
            className: 'text-slate-500 text-xs',
            render: (s) => s.billingType === 'FIXED' ? 'Định kỳ' : 'Theo lượt'
        },
        {
            header: 'Đơn giá',
            accessor: 'price',
            className: 'text-right font-bold text-slate-600',
            mobileLabel: 'Đơn giá',
            render: (s) => (
                <>
                    {formatCurrency(s.price)} <span className="text-xs font-normal text-slate-400">/{s.unit}</span>
                </>
            )
        },
        {
            header: 'Thao tác',
            accessor: 'id',
            className: 'text-right',
            render: (s) => (
                <div className="flex justify-end gap-2 transition-opacity">
                    {onRecordUsage && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!readOnly) {
                                    onRecordUsage(s);
                                }
                            }}
                            className="bg-green-100 text-green-700 p-1.5 rounded hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Ghi nhận sử dụng"
                            aria-label={`service-record-${s.id}`}
                            disabled={readOnly}
                        >
                            <Tag className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!readOnly) {
                                setIsEditing(s);
                                setIsCreating(false);
                            }
                        }}
                        className="bg-blue-100 text-blue-700 p-1.5 rounded hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`service-edit-${s.id}`}
                        disabled={readOnly}
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!readOnly) {
                                onDelete(s.id);
                            }
                        }}
                        className="bg-red-100 text-red-700 p-1.5 rounded hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`service-delete-${s.id}`}
                        disabled={readOnly}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <List className="w-5 h-5 text-teal-600" /> Danh mục dịch vụ
                </h3>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <div className="flex bg-slate-200 rounded-lg p-1 text-sm font-medium shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('FIXED')}
                            className={`px-3 py-1 rounded-md transition-all ${activeTab === 'FIXED' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Cố định tháng
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('ONE_OFF')}
                            className={`px-3 py-1 rounded-md transition-all ${activeTab === 'ONE_OFF' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Phát sinh
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (readOnly) {
                                return;
                            }

                            setIsCreating(true);
                            setIsEditing(null);
                        }}
                        className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2 shrink-0 ml-auto md:ml-0 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={readOnly}
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Thêm dịch vụ</span>
                        <span className="sm:hidden">Thêm</span>
                    </button>
                </div>
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
                        unit: activeTab === 'FIXED' ? 'Tháng' : 'Lần',
                        billingType: activeTab
                    }}
                    onSave={handleFormSave}
                    onCancel={() => { setIsCreating(false); setIsEditing(null); }}
                />
            )}

            <Table
                data={filteredServices}
                columns={columns}
                mobileCardView={true}
            />
        </div>
    );
};
