import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
   X,
   ArrowLeft,
   ArrowRight,
   CheckCircle2,
   BedDouble,
   AlertCircle,
   Building,
   FileDown,
   FileText,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';

import { Resident, ResidentListItem } from '@/src/types/index';
import { generateClinicCode } from '@/src/utils/clinicCodeUtils';
import { generateRooms } from '@/src/data/index';
import { useRoomConfigStore } from '@/src/stores/roomConfigStore';
import { BUILDING_STRUCTURE, getFloorsForBuilding } from '@/src/constants/facility';
import {
   buildContractDocx,
   buildContractFileName,
   ContractContext,
} from '../admission/contract/buildContractDocx';
import { generateContractNumber } from '../admission/contract/generateContractNumber';
import {
   ResidentDocKey,
   uploadResidentDocument,
} from '../../../services/residentDocumentsService';
import { FileUploadField } from './FileUploadField';

const admissionSchema = z.object({
   // Step 1 — NCT
   name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
   dob: z.string().min(1, 'Vui lòng chọn ngày sinh'),
   gender: z.enum(['Nam', 'Nữ']),
   idCard: z.string().optional(),
   isDiabetic: z.boolean().optional(),

   // Step 2 — Bảo trợ
   guardianName: z.string().min(2, 'Vui lòng nhập tên người bảo trợ'),
   guardianPhone: z
      .string()
      .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không đúng định dạng'),
   guardianDob: z.string().optional(),
   guardianAddress: z.string().optional(),
   guardianIdCard: z.string().optional(),
   guardianRelation: z.string().optional(),

   // Step 3 — Phòng & Cấp độ
   careLevel: z.number().min(1).max(4),
   building: z.string().optional(),
   floor: z.string().optional(),
   roomNumber: z.string().optional(),
   bedId: z.string().optional(),

   // Step 4 — Hợp đồng
   contractNumber: z.string().min(1, 'Số hợp đồng không hợp lệ'),
   signedDate: z.string().min(1, 'Ngày ký không hợp lệ'),
});

type FormData = z.infer<typeof admissionSchema>;

interface AdmissionWizardProps {
   onSave: (data: Partial<Resident>) => Promise<void> | void;
   onCancel: () => void;
   existingCodes?: string[];
   existingContractNumbers?: string[];
   allResidents?: ResidentListItem[];
}

const STEPS = [
   { num: 1, title: 'Người cao tuổi' },
   { num: 2, title: 'Người bảo trợ' },
   { num: 3, title: 'Phòng & Cấp độ' },
   { num: 4, title: 'Hợp đồng' },
] as const;

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
   1: ['name', 'dob', 'gender', 'idCard'],
   2: ['guardianName', 'guardianPhone'],
   3: ['careLevel'],
   4: ['contractNumber', 'signedDate'],
};

export const AdmissionWizard = ({
   onSave,
   onCancel,
   existingCodes = [],
   existingContractNumbers = [],
   allResidents = [],
}: AdmissionWizardProps) => {
   const [step, setStep] = useState(1);
   const [submitting, setSubmitting] = useState(false);
   const [downloading, setDownloading] = useState(false);
   const [skipBed, setSkipBed] = useState(false);
   const [files, setFiles] = useState<Partial<Record<ResidentDocKey, File>>>({});

   const setFile = (key: ResidentDocKey, file: File | undefined) =>
      setFiles((prev) => {
         const next = { ...prev };
         if (file) next[key] = file;
         else delete next[key];
         return next;
      });

   const today = new Date().toISOString().split('T')[0];
   const defaultContractNumber = generateContractNumber(existingContractNumbers);

   const { configs } = useRoomConfigStore();

   const {
      register,
      handleSubmit,
      trigger,
      watch,
      setValue,
      getValues,
      formState: { errors },
   } = useForm<FormData>({
      resolver: zodResolver(admissionSchema),
      defaultValues: {
         name: '',
         gender: 'Nam',
         careLevel: 1,
         idCard: '',
         guardianAddress: '',
         guardianIdCard: '',
         guardianRelation: 'Con trai',
         isDiabetic: false,
         building: 'Tòa A',
         floor: 'Tầng 2',
         roomNumber: '',
         bedId: '',
         contractNumber: defaultContractNumber,
         signedDate: today,
      },
   });

   const careLevel = watch('careLevel');
   const building = watch('building') ?? 'Tòa A';
   const floor = watch('floor') ?? 'Tầng 2';
   const roomNumber = watch('roomNumber') ?? '';
   const bedId = watch('bedId') ?? '';

   const allRooms = useMemo(() => generateRooms(allResidents, [], configs), [allResidents, configs]);

   const roomsOnFloor = useMemo(
      () => allRooms.filter((r) => r.building === building && r.floor === floor),
      [allRooms, building, floor],
   );

   const selectedRoom = useMemo(
      () => roomsOnFloor.find((r) => r.number === roomNumber),
      [roomsOnFloor, roomNumber],
   );

   const availableBeds = useMemo(
      () => (selectedRoom ? selectedRoom.beds.filter((b) => b.status === 'Available') : []),
      [selectedRoom],
   );

   const floors = getFloorsForBuilding(building);

   const handleNext = async () => {
      const fields = STEP_FIELDS[step];
      const valid = await trigger(fields as any);
      if (!valid) return;
      if (step === 3 && !skipBed && (!roomNumber || !bedId)) {
         toast.error('Chọn phòng và giường, hoặc bấm "Bỏ qua xếp phòng".');
         return;
      }
      setStep((s) => s + 1);
   };

   const buildContractCtx = (): ContractContext => {
      const v = getValues();
      return {
         contractNumber: v.contractNumber,
         signedDate: v.signedDate,
         residentName: v.name,
         residentDob: v.dob,
         residentAddress: v.guardianAddress,
         residentIdCard: v.idCard,
         guardianName: v.guardianName,
         guardianDob: v.guardianDob,
         guardianAddress: v.guardianAddress,
         guardianPhone: v.guardianPhone,
         guardianIdCard: v.guardianIdCard,
         guardianRelation: v.guardianRelation,
      };
   };

   const handleDownloadContract = async () => {
      const valid = await trigger();
      if (!valid) {
         toast.error('Vui lòng kiểm tra lại các trường thông tin.');
         return;
      }
      setDownloading(true);
      try {
         const ctx = buildContractCtx();
         const blob = await buildContractDocx(ctx);
         saveAs(blob, buildContractFileName(ctx));
         toast.success('Đã tải hợp đồng .docx');
      } catch (error) {
         console.error(error);
         toast.error(`Lỗi tạo hợp đồng: ${(error as Error).message}`);
      } finally {
         setDownloading(false);
      }
   };

   const handleSaveAndDownload = async () => {
      const valid = await trigger();
      if (!valid) {
         toast.error('Vui lòng kiểm tra lại các trường thông tin.');
         return;
      }
      setSubmitting(true);
      try {
         const ctx = buildContractCtx();
         const blob = await buildContractDocx(ctx);
         saveAs(blob, buildContractFileName(ctx));
         await handleSubmit(onSubmit)();
      } catch (error) {
         console.error(error);
         toast.error(`Lỗi tạo hợp đồng: ${(error as Error).message}`);
         setSubmitting(false);
      }
   };

   const uploadAllFiles = async (residentId: string) => {
      const entries = Object.entries(files) as [ResidentDocKey, File][];
      const uploaded: Partial<Record<ResidentDocKey, string>> = {};
      await Promise.all(
         entries.map(async ([key, file]) => {
            uploaded[key] = await uploadResidentDocument(residentId, key, file);
         }),
      );
      return uploaded;
   };

   const onSubmit = async (data: FormData) => {
      setSubmitting(true);
      try {
         const tempResident: Partial<Resident> = {
            ...data,
            gender: data.gender as 'Nam' | 'Nữ',
            careLevel: data.careLevel as 1 | 2 | 3 | 4,
         };
         const clinicCode = generateClinicCode(tempResident, existingCodes);

         const residentId = crypto.randomUUID();

         let docPaths: Partial<Record<ResidentDocKey, string>> = {};
         if (Object.keys(files).length > 0) {
            try {
               docPaths = await uploadAllFiles(residentId);
            } catch (error) {
               console.error(error);
               toast.error(`Lỗi tải ảnh giấy tờ: ${(error as Error).message}`);
               throw error;
            }
         }

         const bedLabel = skipBed
            ? ''
            : data.bedId.split('-')[2] || '';
         const roomTypeFromSelection: ResidentListItem['roomType'] =
            (selectedRoom?.type as ResidentListItem['roomType']) || '2 Giường';

         await onSave({
            id: residentId,
            name: data.name,
            dob: data.dob,
            gender: data.gender,
            clinicCode,
            careLevel: data.careLevel as 1 | 2 | 3 | 4,
            isDiabetic: data.isDiabetic,
            guardianName: data.guardianName,
            guardianPhone: data.guardianPhone,
            guardianAddress: data.guardianAddress,
            guardianIdCard: data.guardianIdCard,
            guardianRelation: data.guardianRelation,
            guardianDob: data.guardianDob || undefined,
            idCard: data.idCard,
            idCardFrontPath: docPaths.idCardFront,
            idCardBackPath: docPaths.idCardBack,
            guardianIdCardFrontPath: docPaths.guardianIdCardFront,
            guardianIdCardBackPath: docPaths.guardianIdCardBack,
            bhytCardPath: docPaths.bhytCard,
            contractNumber: `${data.contractNumber}/${new Date(data.signedDate).getFullYear()}/DV-VDL`,
            contractSignedDate: data.signedDate,
            building: skipBed ? '' : data.building || '',
            floor: skipBed ? '' : data.floor || '',
            room: skipBed ? '' : data.roomNumber || '',
            bed: bedLabel,
            roomType: roomTypeFromSelection,
            status: 'Active',
            admissionDate: data.signedDate || today,
            balance: 0,
         });
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[92vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-800">Tiếp nhận NCT mới</h2>
               <button onClick={onCancel}>
                  <X className="w-6 h-6 text-slate-400 hover:text-red-500" />
               </button>
            </div>

            {/* Stepper */}
            <div className="relative flex items-center justify-between px-6 md:px-12 py-6 bg-slate-50">
               {STEPS.map((s) => (
                  <div key={s.num} className="flex flex-col items-center relative z-10">
                     <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
                           step >= s.num ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                     >
                        {s.num}
                     </div>
                     <span
                        className={`text-xs font-medium text-center ${
                           step >= s.num ? 'text-teal-700' : 'text-slate-400'
                        }`}
                     >
                        {s.title}
                     </span>
                  </div>
               ))}
               <div className="absolute top-[34px] left-12 right-12 h-0.5 bg-slate-200 -z-0">
                  <div
                     className="h-full bg-teal-600 transition-all duration-300"
                     style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                  />
               </div>
            </div>

            <form className="flex-1 overflow-y-auto p-6 md:p-8">
               {step === 1 && (
                  <div className="space-y-4">
                     <Field label="Họ và tên" required error={errors.name?.message}>
                        <input
                           {...register('name')}
                           type="text"
                           className={inputClass(errors.name)}
                           placeholder="VD: Nguyễn Văn A"
                        />
                     </Field>
                     <div className="grid grid-cols-2 gap-4">
                        <Field label="Ngày sinh" required error={errors.dob?.message}>
                           <input {...register('dob')} type="date" className={inputClass(errors.dob)} />
                        </Field>
                        <Field label="Giới tính">
                           <select {...register('gender')} className={inputClass()}>
                              <option value="Nam">Nam</option>
                              <option value="Nữ">Nữ</option>
                           </select>
                        </Field>
                     </div>
                     <Field label="Số CCCD/CMND">
                        <input {...register('idCard')} type="text" className={inputClass()} placeholder="0791..." />
                     </Field>
                     <label className="flex items-center gap-2 mt-2">
                        <input
                           type="checkbox"
                           {...register('isDiabetic')}
                           className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Người cao tuổi có tiểu đường</span>
                     </label>

                     <div className="border-t border-slate-100 pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                           Giấy tờ tùy thân <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           <FileUploadField
                              label="CCCD / CMND - mặt trước"
                              value={files.idCardFront}
                              onChange={(f) => setFile('idCardFront', f)}
                           />
                           <FileUploadField
                              label="CCCD / CMND - mặt sau"
                              value={files.idCardBack}
                              onChange={(f) => setFile('idCardBack', f)}
                           />
                        </div>
                        <div className="mt-3">
                           <FileUploadField
                              label="Thẻ BHYT"
                              value={files.bhytCard}
                              onChange={(f) => setFile('bhytCard', f)}
                           />
                        </div>
                     </div>
                  </div>
               )}

               {step === 2 && (
                  <div className="space-y-4">
                     <Field label="Họ tên người bảo trợ" required error={errors.guardianName?.message}>
                        <input
                           {...register('guardianName')}
                           type="text"
                           className={inputClass(errors.guardianName)}
                        />
                     </Field>
                     <div className="grid grid-cols-2 gap-4">
                        <Field label="Số điện thoại" required error={errors.guardianPhone?.message}>
                           <input
                              {...register('guardianPhone')}
                              type="text"
                              className={inputClass(errors.guardianPhone)}
                              placeholder="0901..."
                           />
                        </Field>
                        <Field label="Mối quan hệ với NCT">
                           <select {...register('guardianRelation')} className={inputClass()}>
                              {['Con trai', 'Con gái', 'Vợ', 'Chồng', 'Anh', 'Chị', 'Em', 'Cháu', 'Khác'].map(
                                 (r) => (
                                    <option key={r} value={r}>
                                       {r}
                                    </option>
                                 ),
                              )}
                           </select>
                        </Field>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Field label="Ngày sinh người bảo trợ">
                           <input {...register('guardianDob')} type="date" className={inputClass()} />
                        </Field>
                        <Field label="Số CCCD/CMND người bảo trợ">
                           <input {...register('guardianIdCard')} type="text" className={inputClass()} />
                        </Field>
                     </div>
                     <Field label="Địa chỉ liên hệ">
                        <textarea {...register('guardianAddress')} className={inputClass()} rows={2} />
                     </Field>

                     <div className="border-t border-slate-100 pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                           Giấy tờ tùy thân (bảo trợ){' '}
                           <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           <FileUploadField
                              label="CCCD / CMND - mặt trước"
                              value={files.guardianIdCardFront}
                              onChange={(f) => setFile('guardianIdCardFront', f)}
                           />
                           <FileUploadField
                              label="CCCD / CMND - mặt sau"
                              value={files.guardianIdCardBack}
                              onChange={(f) => setFile('guardianIdCardBack', f)}
                           />
                        </div>
                     </div>
                  </div>
               )}

               {step === 3 && (
                  <div className="space-y-5">
                     <Field label="Cấp độ chăm sóc dự kiến">
                        <select
                           {...register('careLevel', { valueAsNumber: true })}
                           className={inputClass()}
                        >
                           <option value={1}>Cấp độ 1 — Tự lập / Hỗ trợ tối thiểu</option>
                           <option value={2}>Cấp độ 2 — Hỗ trợ mức vừa</option>
                           <option value={3}>Cấp độ 3 — Hỗ trợ mức cao</option>
                           <option value={4}>Cấp độ 4 — Phụ thuộc hoàn toàn</option>
                        </select>
                     </Field>

                     <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex items-start gap-2 border border-yellow-100">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                           Cấp độ chính thức xác định sau khi Bác sĩ đánh giá chuyên môn (trong 24h sau tiếp nhận).
                        </span>
                     </div>

                     <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                           <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                              <BedDouble className="w-4 h-4 text-teal-600" /> Xếp phòng & giường
                           </h4>
                           <label className="flex items-center gap-2 text-xs text-slate-500">
                              <input
                                 type="checkbox"
                                 checked={skipBed}
                                 onChange={(e) => {
                                    setSkipBed(e.target.checked);
                                    if (e.target.checked) {
                                       setValue('roomNumber', '');
                                       setValue('bedId', '');
                                    }
                                 }}
                                 className="w-3.5 h-3.5"
                              />
                              Bỏ qua, xử lý sau
                           </label>
                        </div>

                        {!skipBed && (
                           <div className="space-y-3">
                              <div>
                                 <label className="text-xs font-medium text-slate-600 mb-1 block">Toà nhà</label>
                                 <div className="flex gap-2">
                                    {BUILDING_STRUCTURE.map((b) => (
                                       <button
                                          key={b.id}
                                          type="button"
                                          onClick={() => {
                                             setValue('building', b.id);
                                             const fs = getFloorsForBuilding(b.id);
                                             setValue('floor', fs[0] || '');
                                             setValue('roomNumber', '');
                                             setValue('bedId', '');
                                          }}
                                          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors ${
                                             building === b.id
                                                ? 'border-slate-800 bg-slate-800 text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                          }`}
                                       >
                                          <Building className="w-4 h-4" /> {b.name}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                              <div>
                                 <label className="text-xs font-medium text-slate-600 mb-1 block">Tầng</label>
                                 <div className="grid grid-cols-5 gap-2">
                                    {floors.map((f) => (
                                       <button
                                          key={f}
                                          type="button"
                                          onClick={() => {
                                             setValue('floor', f);
                                             setValue('roomNumber', '');
                                             setValue('bedId', '');
                                          }}
                                          className={`rounded-lg border py-2 text-sm transition-colors ${
                                             floor === f
                                                ? 'border-teal-600 bg-teal-600 text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-teal-400'
                                          }`}
                                       >
                                          {f.replace('Tầng ', 'T')}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                              <div>
                                 <label className="text-xs font-medium text-slate-600 mb-1 block">Phòng</label>
                                 <select
                                    value={roomNumber}
                                    onChange={(e) => {
                                       setValue('roomNumber', e.target.value);
                                       setValue('bedId', '');
                                    }}
                                    className={inputClass()}
                                 >
                                    <option value="">— Chọn phòng —</option>
                                    {roomsOnFloor.map((r) => {
                                       const free = r.beds.filter((b) => b.status === 'Available').length;
                                       return (
                                          <option key={r.id} value={r.number} disabled={free === 0}>
                                             P.{r.number} ({r.type}) — Trống {free} giường
                                          </option>
                                       );
                                    })}
                                 </select>
                              </div>
                              <div>
                                 <label className="text-xs font-medium text-slate-600 mb-1 block">Giường</label>
                                 <div className="grid grid-cols-3 gap-2">
                                    {availableBeds.length > 0 ? (
                                       availableBeds.map((b) => (
                                          <button
                                             key={b.id}
                                             type="button"
                                             onClick={() => setValue('bedId', b.id)}
                                             className={`rounded-lg border p-3 text-sm flex items-center justify-center gap-2 transition-colors ${
                                                bedId === b.id
                                                   ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                   : 'border-slate-200 bg-white hover:border-teal-300'
                                             }`}
                                          >
                                             <BedDouble className="w-4 h-4" />
                                             Giường {b.id.split('-')[2]}
                                             {bedId === b.id && <CheckCircle2 className="w-4 h-4" />}
                                          </button>
                                       ))
                                    ) : (
                                       <div className="col-span-3 rounded-lg bg-slate-50 py-4 text-center text-sm italic text-slate-400">
                                          {roomNumber ? 'Phòng đã đầy' : 'Chọn phòng trước'}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {step === 4 && (
                  <div className="space-y-4">
                     <div className="p-4 rounded-lg border border-teal-100 bg-teal-50/50 text-sm text-teal-900">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Hợp đồng tải xuống dạng <code>.docx</code> đúng format mẫu pháp lý. Phần để trống điền tay khi ký.
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Field label="Số hợp đồng" required error={errors.contractNumber?.message}>
                           <div className="flex items-center gap-1">
                              <input
                                 {...register('contractNumber')}
                                 type="text"
                                 className={inputClass(errors.contractNumber)}
                              />
                              <span className="text-sm text-slate-500 whitespace-nowrap">
                                 /{new Date().getFullYear()}/DV-VDL
                              </span>
                           </div>
                        </Field>
                        <Field label="Ngày ký" required error={errors.signedDate?.message}>
                           <input
                              {...register('signedDate')}
                              type="date"
                              className={inputClass(errors.signedDate)}
                           />
                        </Field>
                     </div>

                     <ReviewSection
                        title="Người cao tuổi"
                        rows={[
                           ['Họ tên', watch('name')],
                           ['Ngày sinh', watch('dob')],
                           ['Giới tính', watch('gender')],
                           ['CCCD', watch('idCard') || '—'],
                           ['Tiểu đường', watch('isDiabetic') ? 'Có' : 'Không'],
                        ]}
                     />
                     <ReviewSection
                        title="Người bảo trợ"
                        rows={[
                           ['Họ tên', watch('guardianName')],
                           ['Ngày sinh', watch('guardianDob') || '—'],
                           ['SĐT', watch('guardianPhone')],
                           ['Mối quan hệ', watch('guardianRelation') || '—'],
                           ['CCCD', watch('guardianIdCard') || '—'],
                           ['Địa chỉ', watch('guardianAddress') || '—'],
                        ]}
                     />
                     <ReviewSection
                        title="Phòng & Cấp độ"
                        rows={[
                           ['Cấp độ', `Cấp độ ${careLevel}`],
                           [
                              'Vị trí',
                              skipBed
                                 ? '— (xử lý sau)'
                                 : `${watch('building')} • ${watch('floor')} • P.${roomNumber} • Giường ${bedId
                                      .split('-')[2] || '—'}`,
                           ],
                        ]}
                     />

                     <button
                        type="button"
                        onClick={handleDownloadContract}
                        disabled={downloading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-teal-200 bg-white text-teal-700 hover:bg-teal-50 disabled:opacity-60"
                     >
                        <FileDown className="w-4 h-4" />
                        {downloading ? 'Đang tạo hợp đồng…' : 'Tải hợp đồng (.docx)'}
                     </button>
                  </div>
               )}
            </form>

            <div className="p-4 md:p-6 border-t border-slate-200 flex justify-between bg-slate-50">
               {step > 1 ? (
                  <button
                     type="button"
                     onClick={() => setStep((s) => s - 1)}
                     className="flex items-center gap-2 px-4 py-2 border rounded-lg text-slate-600 hover:bg-white"
                  >
                     <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
               ) : (
                  <span />
               )}

               {step < STEPS.length ? (
                  <button
                     type="button"
                     onClick={handleNext}
                     className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                     Tiếp tục <ArrowRight className="w-4 h-4" />
                  </button>
               ) : (
                  <div className="flex items-center gap-2">
                     <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit(onSubmit)}
                        className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 disabled:opacity-60"
                     >
                        <CheckCircle2 className="w-4 h-4" />
                        {submitting ? 'Đang lưu…' : 'Lưu không tải'}
                     </button>
                     <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSaveAndDownload}
                        className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 shadow-lg shadow-teal-900/10"
                     >
                        <FileDown className="w-4 h-4" />
                        {submitting ? 'Đang xử lý…' : 'Lưu & tải hợp đồng'}
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

const inputClass = (err?: { message?: string } | unknown): string =>
   `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
      err ? 'border-red-500' : 'border-slate-300'
   }`;

const Field = ({
   label,
   required,
   error,
   children,
}: {
   label: string;
   required?: boolean;
   error?: string;
   children: React.ReactNode;
}) => (
   <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
         {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
   </div>
);

const ReviewSection = ({ title, rows }: { title: string; rows: [string, string | undefined | number][] }) => (
   <div className="rounded-lg border border-slate-200 bg-white">
      <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
         {title}
      </div>
      <table className="w-full text-sm">
         <tbody>
            {rows.map(([k, v]) => (
               <tr key={k} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-1.5 text-slate-500 w-32">{k}</td>
                  <td className="px-3 py-1.5 text-slate-800">{v ?? '—'}</td>
               </tr>
            ))}
         </tbody>
      </table>
   </div>
);
