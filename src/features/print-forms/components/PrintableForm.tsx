import React from 'react';
import { Printer } from 'lucide-react';
import { User, Resident } from '../../../types/index';

export const PrintableForm = ({ user, residents, type, formId, config, onClose }: { user: User, residents: Resident[], type: string, formId?: string, config?: any, onClose: () => void }) => {
   // Use config or defaults
   const building = config?.building || 'Tòa A';
   const floor = config?.floor || 'Tầng 1';
   const dateStr = config?.date ? new Date(config.date).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN');
   const shift = config?.shift || 'Sáng';

   const filteredResidents = residents.filter(r => r.floor === floor && r.building === building);
   // This component simulates the print view
   return (
      <div className="fixed inset-0 bg-white z-[9999] overflow-auto">
         {/* Print Controls - Hidden when printing */}
         <div className="fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 flex justify-between items-center print:hidden shadow-lg">
            <h2 className="font-bold text-lg">Xem trước bản in: {type}</h2>
            <div className="flex gap-4">
               <button onClick={onClose} className="px-4 py-2 hover:bg-slate-700 rounded text-sm">Đóng</button>
               <button onClick={() => window.print()} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded text-sm font-bold flex items-center gap-2">
                  <Printer className="w-4 h-4" /> In ngay
               </button>
            </div>
         </div>

         {/* Actual A4 Page Content */}
         <div className="mt-20 print:mt-0 max-w-[210mm] mx-auto bg-white p-[10mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full">
            {/* FDC Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-8">
               <div>
                  <h1 className="text-2xl font-bold uppercase text-teal-800">Viện Dưỡng Lão FDC</h1>
                  <p className="text-sm text-slate-600">Địa chỉ: 123 Đường ABC, Quận 7, TP.HCM</p>
                  <p className="text-sm text-slate-600">Hotline: 028 1234 5678</p>
               </div>
               <div className="text-right">
                  <h2 className="text-xl font-bold uppercase mt-2">{type}</h2>
                  <p className="text-sm text-slate-500 italic">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
                  <p className="text-sm text-slate-500 italic">Người in: {user.name}</p>
               </div>
            </div>

            {/* Form Content Switch */}
            {type === 'PHIẾU THEO DÕI SINH HIỆU' && (
               <div>
                  <div className="flex justify-between mb-4 font-bold">
                     <span>Khu vực: {floor} - {building}</span>
                     <span>Ngày: {dateStr}</span>
                  </div>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                     <thead>
                        <tr className="bg-slate-100">
                           <th className="border border-slate-900 p-2 w-10">P</th>
                           <th className="border border-slate-900 p-2 w-40">Họ và tên</th>
                           <th className="border border-slate-900 p-2">Giờ</th>
                           <th className="border border-slate-900 p-2">Huyết áp</th>
                           <th className="border border-slate-900 p-2">Mạch</th>
                           <th className="border border-slate-900 p-2">Nhiệt</th>
                           <th className="border border-slate-900 p-2">SpO2</th>
                           <th className="border border-slate-900 p-2">Ghi chú</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredResidents.map((r, i) => (
                           <React.Fragment key={i}>
                              <tr className="h-10">
                                 <td className="border border-slate-900 p-2 text-center font-bold" rowSpan={2}>{r.room}</td>
                                 <td className="border border-slate-900 p-2 font-medium" rowSpan={2}>{r.name}</td>
                                 <td className="border border-slate-900 p-1 text-center">07:00</td>
                                 <td className="border border-slate-900 p-1"></td>
                                 <td className="border border-slate-900 p-1"></td>
                                 <td className="border border-slate-900 p-1"></td>
                                 <td className="border border-slate-900 p-1"></td>
                                 <td className="border border-slate-900 p-1"></td>
                              </tr>
                              <tr className="h-10">
                                 <td className="border border-slate-900 p-1 text-center">14:00</td>
                                 <td className="border border-slate-900 p-1"></td>
                                 <td className="border border-slate-900 p-1"></td>
                                 <td className="border border-slate-900 p-1"></td>
                                 <td className="border border-slate-900 p-1"></td>
                                 <td className="border border-slate-900 p-1"></td>
                              </tr>
                           </React.Fragment>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {type === 'PHIẾU PHÁT THUỐC' && (
               <div>
                  <div className="flex justify-between mb-4 font-bold">
                     <span>Ca: {shift} ({shift === 'Sáng' ? '06:00 - 14:00' : shift === 'Chiều' ? '14:00 - 22:00' : '22:00 - 06:00'})</span>
                     <span>{floor} - Ngày: {dateStr}</span>
                  </div>
                  <table className="w-full border-collapse border border-slate-900 text-sm">
                     <thead>
                        <tr className="bg-slate-100">
                           <th className="border border-slate-900 p-2 w-12">Phòng</th>
                           <th className="border border-slate-900 p-2">Họ tên</th>
                           <th className="border border-slate-900 p-2">Tên thuốc - Liều lượng</th>
                           <th className="border border-slate-900 p-2 w-16">Đã uống</th>
                           <th className="border border-slate-900 p-2 w-32">Ký tên</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredResidents.map((r, i) => (
                           <tr key={i}>
                              <td className="border border-slate-900 p-2 text-center font-bold">{r.room}</td>
                              <td className="border border-slate-900 p-2">{r.name}</td>
                              <td className="border border-slate-900 p-2">
                                 {r.prescriptions.filter(p => p.status === 'Active').map((p, idx) => (
                                    <div key={idx} className="mb-1">• {p.medicationName} ({p.dosage})</div>
                                 ))}
                                 {r.prescriptions.filter(p => p.status === 'Active').length === 0 && <span className="text-slate-400 italic">Không có thuốc</span>}
                              </td>
                              <td className="border border-slate-900 p-2"></td>
                              <td className="border border-slate-900 p-2"></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {type === 'PHIẾU THEO DÕI BỮA ĂN' && (
               <div>
                  <div className="flex justify-between mb-4 font-bold">
                     <span>Khu vực: {floor} - {building}</span>
                     <span>Ngày: {dateStr}</span>
                  </div>
                  <table className="w-full border-collapse border border-slate-900 text-sm">
                     <thead>
                        <tr className="bg-slate-100">
                           <th className="border border-slate-900 p-2 w-12" rowSpan={2}>Phòng</th>
                           <th className="border border-slate-900 p-2" rowSpan={2}>Họ tên</th>
                           <th className="border border-slate-900 p-2" rowSpan={2}>Chế độ ăn</th>
                           <th className="border border-slate-900 p-2" colSpan={3}>Sáng</th>
                           <th className="border border-slate-900 p-2" colSpan={3}>Trưa</th>
                           <th className="border border-slate-900 p-2" colSpan={3}>Chiều</th>
                        </tr>
                        <tr className="bg-slate-100 text-xs">
                           <th className="border border-slate-900 p-1">Hết</th>
                           <th className="border border-slate-900 p-1">1/2</th>
                           <th className="border border-slate-900 p-1">K</th>
                           <th className="border border-slate-900 p-1">Hết</th>
                           <th className="border border-slate-900 p-1">1/2</th>
                           <th className="border border-slate-900 p-1">K</th>
                           <th className="border border-slate-900 p-1">Hết</th>
                           <th className="border border-slate-900 p-1">1/2</th>
                           <th className="border border-slate-900 p-1">K</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredResidents.map((r, i) => (
                           <tr key={i} className="h-12">
                              <td className="border border-slate-900 p-2 text-center font-bold">{r.room}</td>
                              <td className="border border-slate-900 p-2">{r.name}</td>
                              <td className="border border-slate-900 p-2 text-center">Cơm</td>
                              <td className="border border-slate-900 p-1"></td>
                              <td className="border border-slate-900 p-1"></td>
                              <td className="border border-slate-900 p-1"></td>
                              <td className="border border-slate-900 p-1"></td>
                              <td className="border border-slate-900 p-1"></td>
                              <td className="border border-slate-900 p-1"></td>
                              <td className="border border-slate-900 p-1"></td>
                              <td className="border border-slate-900 p-1"></td>
                              <td className="border border-slate-900 p-1"></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {type === 'PHIẾU GHI NHẬN SỰ CỐ' && (
               <div className="max-w-3xl mx-auto border border-slate-900 p-8">
                  <div className="grid grid-cols-2 gap-8 mb-6">
                     <div>
                        <label className="block font-bold mb-2">Thời gian xảy ra:</label>
                        <div className="border-b border-slate-400 h-8"></div>
                     </div>
                     <div>
                        <label className="block font-bold mb-2">Địa điểm:</label>
                        <div className="border-b border-slate-400 h-8"></div>
                     </div>
                  </div>

                  <div className="mb-6">
                     <label className="block font-bold mb-2">Người liên quan (NCT/Nhân viên):</label>
                     <div className="border-b border-slate-400 h-8"></div>
                  </div>

                  <div className="mb-6">
                     <label className="block font-bold mb-2">Mô tả sự cố:</label>
                     <div className="border border-slate-400 h-32 rounded"></div>
                  </div>

                  <div className="mb-6">
                     <label className="block font-bold mb-2">Xử lý ban đầu:</label>
                     <div className="border border-slate-400 h-24 rounded"></div>
                  </div>

                  <div className="mb-6">
                     <label className="block font-bold mb-2">Người chứng kiến:</label>
                     <div className="border-b border-slate-400 h-8"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-16 mt-12 text-center">
                     <div>
                        <p className="font-bold">Người lập biên bản</p>
                        <p className="mt-4 font-medium">{user.name}</p>
                        <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
                     </div>
                     <div>
                        <p className="font-bold">Quản lý xác nhận</p>
                        <p className="italic text-xs mt-12">(Ký và ghi rõ họ tên)</p>
                     </div>
                  </div>
               </div>
            )}

            {type === 'PHIẾU PHÂN CÔNG CA TRỰC' && (
               <div>
                  <div className="flex justify-between mb-4 font-bold">
                     <span>Tuần: {dateStr}</span>
                     <span>Khu vực: {floor}</span>
                  </div>
                  <table className="w-full border-collapse border border-slate-900 text-sm text-center">
                     <thead>
                        <tr className="bg-slate-100">
                           <th className="border border-slate-900 p-2 w-40">Nhân viên</th>
                           <th className="border border-slate-900 p-2">Thứ 2</th>
                           <th className="border border-slate-900 p-2">Thứ 3</th>
                           <th className="border border-slate-900 p-2">Thứ 4</th>
                           <th className="border border-slate-900 p-2">Thứ 5</th>
                           <th className="border border-slate-900 p-2">Thứ 6</th>
                           <th className="border border-slate-900 p-2">Thứ 7</th>
                           <th className="border border-slate-900 p-2">CN</th>
                        </tr>
                     </thead>
                     <tbody>
                        {['Nguyễn Thị Lan (YT)', 'Trần Văn Hùng (ĐD)', 'Lê Thị Mai (ĐD)', 'Phạm Văn Tú (HL)'].map((name, i) => (
                           <tr key={i} className="h-12">
                              <td className="border border-slate-900 p-2 text-left font-bold">{name}</td>
                              <td className="border border-slate-900 p-2">{Math.random() > 0.3 ? 'Sáng' : 'OFF'}</td>
                              <td className="border border-slate-900 p-2">{Math.random() > 0.3 ? 'Chiều' : 'Sáng'}</td>
                              <td className="border border-slate-900 p-2">{Math.random() > 0.3 ? 'Sáng' : 'Chiều'}</td>
                              <td className="border border-slate-900 p-2">{Math.random() > 0.3 ? 'Chiều' : 'Đêm'}</td>
                              <td className="border border-slate-900 p-2">{Math.random() > 0.3 ? 'Sáng' : 'OFF'}</td>
                              <td className="border border-slate-900 p-2">{Math.random() > 0.3 ? 'Đêm' : 'Chiều'}</td>
                              <td className="border border-slate-900 p-2">{Math.random() > 0.3 ? 'OFF' : 'Sáng'}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  <div className="mt-4 text-xs italic">
                     * Ghi chú: Sáng (06:00 - 14:00), Chiều (14:00 - 22:00), Đêm (22:00 - 06:00)
                  </div>
               </div>
            )}

            {/* Footer Signature (Default for lists) */}
            {type !== 'PHIẾU GHI NHẬN SỰ CỐ' && (
               <div className="mt-16 flex justify-between text-center">
                  <div className="w-1/3">
                     <p className="font-bold">Người lập phiếu</p>
                     <p className="mt-4 font-medium">{user.name}</p>
                     <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="w-1/3">
                     <p className="font-bold">Trưởng ca trực</p>
                     <p className="italic text-xs mt-12">(Ký và ghi rõ họ tên)</p>
                  </div>
               </div>
            )}
         </div>
      </div >
   );
};