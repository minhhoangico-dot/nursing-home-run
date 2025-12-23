import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save } from 'lucide-react';
import { InventoryItem } from '../../../types/index';
import { Modal, Input, Select, Button } from '../../../components/ui/index';

const schema = z.object({
   name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
   category: z.enum(['Thuốc', 'Y tế', 'Sinh hoạt', 'Thực phẩm']),
   unit: z.string().min(1, 'Vui lòng nhập đơn vị tính'),
   stock: z.number().min(0, 'Số lượng không được âm'),
   minStock: z.number().min(0, 'Định mức không được âm'),
   price: z.number().min(0, 'Giá không được âm')
});

type FormData = z.infer<typeof schema>;

interface AddStockItemModalProps {
   onClose: () => void;
   onSave: (item: InventoryItem) => void;
}

export const AddStockItemModal = ({ onClose, onSave }: AddStockItemModalProps) => {
   const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
         name: '',
         category: 'Thuốc',
         unit: 'Viên',
         stock: 0,
         minStock: 10,
         price: 0
      }
   });

   const onSubmit = (data: FormData) => {
      onSave({
         id: `I${Math.floor(Math.random() * 10000)}`,
         name: data.name,
         category: data.category as any,
         unit: data.unit,
         stock: Number(data.stock),
         minStock: Number(data.minStock),
         price: Number(data.price)
      });
   };

   return (
      <Modal title="Thêm vật tư mới" onClose={onClose}>
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
               name="name"
               control={control}
               render={({ field }) => (
                  <Input
                     label="Tên vật tư / Thuốc"
                     {...field}
                     placeholder="Nhập tên..."
                     error={errors.name?.message}
                  />
               )}
            />

            <div className="grid grid-cols-2 gap-4">
               <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                     <Select
                        label="Danh mục"
                        {...field}
                        options={[
                           { value: 'Thuốc', label: 'Thuốc' },
                           { value: 'Y tế', label: 'Vật tư Y tế' },
                           { value: 'Sinh hoạt', label: 'Sinh hoạt' },
                           { value: 'Thực phẩm', label: 'Thực phẩm' },
                        ]}
                     />
                  )}
               />
               <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                     <Input
                        label="Đơn vị tính"
                        {...field}
                        placeholder="Viên, Hộp, Cái..."
                        error={errors.unit?.message}
                     />
                  )}
               />
            </div>
            <div className="grid grid-cols-3 gap-4">
               <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                     <Input
                        label="Tồn đầu"
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        error={errors.stock?.message}
                     />
                  )}
               />
               <Controller
                  name="minStock"
                  control={control}
                  render={({ field }) => (
                     <Input
                        label="Định mức tối thiểu"
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        error={errors.minStock?.message}
                     />
                  )}
               />
               <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                     <Input
                        label="Đơn giá vốn"
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        error={errors.price?.message}
                     />
                  )}
               />
            </div>
            <div className="flex justify-end pt-4 gap-2">
               <Button variant="secondary" onClick={onClose} type="button">Hủy</Button>
               <Button type="submit" icon={<Save className="w-4 h-4" />}>Thêm vào kho</Button>
            </div>
         </form>
      </Modal>
   );
};