import React from 'react';
import { X, Printer } from 'lucide-react';
import { ResidentListItem, ServiceUsage } from '../../../types';
import { formatCurrency } from '../../../data/index';
import { useFacilityBranding } from '@/src/hooks/useFacilityBranding';
import { fallbackFacilityLogo } from '@/src/utils/facilityBranding';

interface InvoicePreviewProps {
    resident: ResidentListItem;
    month: string;
    fixedCosts: { name: string; amount: number }[];
    incurredCosts: ServiceUsage[];
    onClose: () => void;
}

export const InvoicePreview = ({ resident, month, fixedCosts, incurredCosts, onClose }: InvoicePreviewProps) => {
    const branding = useFacilityBranding();

    const calculateTotal = () => {
        const fixedTotal = fixedCosts.reduce((sum, item) => sum + item.amount, 0);
        const incurredTotal = incurredCosts.reduce((sum, item) => sum + item.totalAmount, 0);
        return fixedTotal + incurredTotal;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 print:hidden">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        Xem trước Hóa đơn
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-teal-700"
                        >
                            <Printer className="w-4 h-4" /> In Hóa đơn
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-8 bg-slate-50 print:bg-white print:p-0 print:overflow-visible">
                    <div className="bg-white max-w-2xl mx-auto min-h-[800px] p-8 shadow-sm print:shadow-none print:w-full print:max-w-none">
                        <div className="mb-8 pb-8 border-b border-slate-200">
                            <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left">
                                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <img
                                        src={branding.logoSrc}
                                        alt={`Logo ${branding.name}`}
                                        className="h-full w-full object-contain p-3"
                                        onError={event => fallbackFacilityLogo(event.currentTarget)}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold uppercase text-slate-800 mb-2">{branding.name}</h1>
                                    <div className="text-sm text-slate-500 space-y-1">
                                        <p>{branding.address}</p>
                                        <p>Hotline: {branding.phone} - Email: {branding.email}</p>
                                        {branding.taxCode && <p>MST: {branding.taxCode}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold uppercase text-slate-800">HÓA ĐƠN DỊCH VỤ</h2>
                            <p className="text-slate-500 italic">Tháng {month.split('-')[1]} năm {month.split('-')[0]}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                            <div>
                                <span className="text-slate-500 block mb-1">Khách hàng / Người cao tuổi:</span>
                                <span className="font-bold text-slate-800 text-lg">{resident.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-500 block mb-1">Thông tin lưu trú:</span>
                                <span className="font-medium text-slate-800">
                                    Phòng: {resident.room} | Cấp độ CS: {resident.careLevel}
                                </span>
                            </div>
                        </div>

                        <table className="w-full text-sm mb-8">
                            <thead>
                                <tr className="border-b-2 border-slate-800">
                                    <th className="py-2 text-left font-bold text-slate-700">Nội dung</th>
                                    <th className="py-2 text-center font-bold text-slate-700 w-24">ĐVT</th>
                                    <th className="py-2 text-center font-bold text-slate-700 w-24">SL</th>
                                    <th className="py-2 text-right font-bold text-slate-700 w-32">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="bg-slate-50/50">
                                    <td colSpan={4} className="py-2 font-bold text-slate-500 italic pt-4">I. Phí Cố định</td>
                                </tr>
                                {fixedCosts.map((item, index) => (
                                    <tr key={`fixed-${index}`}>
                                        <td className="py-3 text-slate-700 pl-4">{item.name}</td>
                                        <td className="py-3 text-center text-slate-500">Tháng</td>
                                        <td className="py-3 text-center text-slate-500">1</td>
                                        <td className="py-3 text-right font-medium text-slate-700">{formatCurrency(item.amount)}</td>
                                    </tr>
                                ))}

                                <tr className="bg-slate-50/50">
                                    <td colSpan={4} className="py-2 font-bold text-slate-500 italic pt-4">II. Dịch vụ phát sinh</td>
                                </tr>
                                {incurredCosts.length > 0 ? (
                                    incurredCosts.map((usage) => (
                                        <tr key={usage.id}>
                                            <td className="py-3 text-slate-700 pl-4">
                                                {usage.serviceName}
                                                <div className="text-[10px] text-slate-400 italic">
                                                    {new Date(usage.date).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="py-3 text-center text-slate-500">Lần</td>
                                            <td className="py-3 text-center text-slate-500">{usage.quantity}</td>
                                            <td className="py-3 text-right font-medium text-slate-700">{formatCurrency(usage.totalAmount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-slate-400 italic">Không có dịch vụ phát sinh</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-800">
                                <tr>
                                    <td colSpan={3} className="py-4 text-right font-bold text-slate-800 uppercase text-base">Tổng cộng thanh toán</td>
                                    <td className="py-4 text-right font-bold text-teal-700 text-xl">{formatCurrency(calculateTotal())}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="grid grid-cols-2 gap-8 mt-12 mb-12 page-break-inside-avoid">
                            <div className="text-center">
                                <p className="font-bold text-slate-700 mb-16">Người lập phiếu</p>
                                <p className="text-sm text-slate-400">(Ký, họ tên)</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-slate-500 italic mb-2">Ngày ..... tháng ..... năm 20...</p>
                                <p className="font-bold text-slate-700 mb-16">Người nộp tiền</p>
                                <p className="text-sm text-slate-400">(Ký, họ tên)</p>
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-slate-400 print:fixed print:bottom-4 print:left-0 print:w-full">
                            Chứng từ này chỉ có giá trị nội bộ tại {branding.name}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .fixed.inset-0 {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: white;
                        padding: 0;
                        z-index: 9999;
                    }
                    .bg-white.max-w-2xl {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: none;
                        margin: 0;
                        padding: 20px;
                        box-shadow: none;
                    }
                    .bg-white.max-w-2xl * {
                        visibility: visible;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};
